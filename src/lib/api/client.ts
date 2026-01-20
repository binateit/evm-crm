import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";
import { env } from "@/lib/config/env";
import { PropertyFailureResult, Result } from "@/types/common/result.types";

// Extend the AxiosRequestConfig to include metadata
declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}

// Toast notification handler (uses PrimeReact Toast via custom event)
let toastHandler: {
  success: (summary: string, detail?: string) => void;
  error: (summary: string, detail?: string) => void;
  info: (summary: string, detail?: string) => void;
  warn: (summary: string, detail?: string) => void;
} | null = null;

// Function to register toast handler from ToastProvider
export function registerToastHandler(handler: typeof toastHandler) {
  toastHandler = handler;
}

// Helper to show toast notifications
function showToast(
  severity: "success" | "error" | "info" | "warn",
  summary: string,
  detail?: string
) {
  if (toastHandler) {
    toastHandler[severity](summary, detail);
  } else if (typeof window !== "undefined") {
    // Fallback to custom event if handler not registered yet
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { severity, summary, detail },
      })
    );
  }
}

interface ApiErrorData {
  messages?: string[];
  message?: string;
  title?: string;
  exception?: string;
  errors?: Record<string, string[]>;
  propertyResults?: PropertyFailureResult[];
}

/**
 * Create a structured error result matching the Result<T> interface
 */
const createErrorResult = <T = unknown>(
  statusCode: number,
  messages: string[],
  propertyResults: PropertyFailureResult[] = [],
  exception = "",
  source = "Client"
): Result<T> => {
  return {
    succeeded: false,
    messages,
    data: null as T,
    source,
    exception,
    errorCode: statusCode,
    supportMessage: messages[0] || "An error occurred",
    statusCode,
    propertyResults,
  };
};

/**
 * Extract property validation errors from API response
 */
const extractPropertyErrors = (errorData: ApiErrorData | undefined): PropertyFailureResult[] => {
  const propertyErrors: PropertyFailureResult[] = [];

  // Handle .NET style validation errors: { errors: { "fieldName": ["error1", "error2"] } }
  if (errorData?.errors && typeof errorData.errors === "object") {
    Object.entries(errorData.errors).forEach(([propertyName, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((errorMessage) => {
          propertyErrors.push({
            propertyName,
            errorMessage: errorMessage as string,
          });
        });
      }
    });
  }

  // Handle custom propertyResults array from your Result<T> type
  if (Array.isArray(errorData?.propertyResults)) {
    propertyErrors.push(...errorData.propertyResults);
  }

  return propertyErrors;
};

/**
 * Show error toast based on error type
 */
const showErrorToast = (
  statusCode: number,
  messages: string[],
  propertyResults: PropertyFailureResult[]
) => {
  if (propertyResults.length > 0) {
    // Show field-level validation errors
    propertyResults.forEach((error) => {
      showToast("error", "Validation Error", `${error.propertyName}: ${error.errorMessage}`);
    });
  } else if (messages.length > 0) {
    // Show general error messages
    messages.forEach((message) => showToast("error", "Error", message));
  } else {
    // Fallback to status code message
    const defaultMessages: Record<number, string> = {
      400: "Invalid request. Please check your input.",
      403: "You do not have permission to perform this action.",
      404: "The requested resource was not found.",
      423: "Account suspended. Please contact support.",
      500: "Server error. Please try again later.",
    };
    showToast("error", "Error", defaultMessages[statusCode] || "An unexpected error occurred.");
  }
};

/**
 * Redirect to login page and show session expired message
 */
export const redirectToLogin = () => {
  showToast("error", "Session Expired", "Redirecting to login...");
  setTimeout(() => {
    signOut({ callbackUrl: "/" });
  }, 2000);
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/**
 * Request interceptor - Add authentication token and timing
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // Log request details (development only)
    if (process.env.NODE_ENV === "development") {
      console.log("url", config.url);
      console.log("baseURL", config.baseURL);
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        config.data || ""
      );
    }

    // Only add token for client-side requests
    if (typeof window !== "undefined") {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }

    // Add request timing for performance monitoring
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle success and errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (process.env.NODE_ENV === "development") {
      const config = response.config;
      const duration = config.metadata?.startTime
        ? new Date().getTime() - config.metadata.startTime.getTime()
        : 0;
      console.log(
        `✅ API Response: ${config.method?.toUpperCase()} ${config.url} (${duration}ms)`,
        { status: response.status }
      );
    }
    return response;
  },
  async (error: AxiosError | Error): Promise<Result<unknown>> => {
    if (!axios.isAxiosError(error)) {
      // Non-Axios error (e.g., network timeout)
      const result = createErrorResult(
        0,
        ["Network error. Please check your connection."],
        [],
        error.message,
        "Network"
      );
      showToast("error", "Network Error", result.messages[0]);
      return Promise.reject(result);
    }

    const { response, config } = error;
    const statusCode = response?.status || 0;
    const errorData = response?.data as ApiErrorData | undefined;

    if (process.env.NODE_ENV === "development") {
      const duration = config?.metadata?.startTime
        ? new Date().getTime() - config.metadata.startTime.getTime()
        : 0;
      console.error(
        `❌ API Error: ${config?.method?.toUpperCase()} ${config?.url} (${duration}ms)`,
        { status: statusCode, data: errorData }
      );
    }

    // Extract messages and property errors
    const messages: string[] = errorData?.messages || [
      errorData?.message || errorData?.title || "An error occurred",
    ];
    const propertyResults = extractPropertyErrors(errorData);

    // Handle specific status codes
    switch (statusCode) {
      case 400: {
        // Bad Request - Validation errors
        const result = createErrorResult(
          statusCode,
          messages,
          propertyResults,
          errorData?.exception || "",
          "Validation"
        );
        showErrorToast(statusCode, messages, propertyResults);
        return Promise.reject(result);
      }

      case 401: {
        // Unauthorized - Session expired
        if (typeof window !== "undefined") {
          redirectToLogin();
        }
        const result = createErrorResult(
          statusCode,
          ["Your session has expired. Please log in again."],
          [],
          "",
          "Authentication"
        );
        return Promise.reject(result);
      }

      case 403: {
        // Forbidden - No permission
        const result = createErrorResult(
          statusCode,
          messages.length > 0 ? messages : ["You do not have permission to perform this action."],
          propertyResults,
          errorData?.exception || "",
          "Authorization"
        );
        showErrorToast(statusCode, result.messages, propertyResults);
        return Promise.reject(result);
      }

      case 404: {
        // Not Found
        const result = createErrorResult(
          statusCode,
          messages.length > 0 ? messages : ["The requested resource was not found."],
          propertyResults,
          errorData?.exception || "",
          "NotFound"
        );
        showErrorToast(statusCode, result.messages, propertyResults);
        return Promise.reject(result);
      }

      case 423: {
        // Locked - Account suspended
        const result = createErrorResult(
          statusCode,
          messages.length > 0
            ? messages
            : ["Your account has been suspended. Please contact support."],
          propertyResults,
          errorData?.exception || "",
          "AccountLocked"
        );
        showToast("error", "Account Suspended", result.messages[0]);
        if (typeof window !== "undefined") {
          setTimeout(() => {
            signOut({ callbackUrl: "/" });
          }, 2000);
        }
        return Promise.reject(result);
      }

      case 500:
      case 502:
      case 503:
      case 504: {
        // Server errors
        const result = createErrorResult(
          statusCode,
          messages.length > 0 ? messages : ["Server error. Please try again later."],
          propertyResults,
          errorData?.exception || "",
          "Server"
        );
        showErrorToast(statusCode, result.messages, propertyResults);
        return Promise.reject(result);
      }

      default: {
        // Unknown error
        const result = createErrorResult(
          statusCode,
          messages.length > 0 ? messages : ["An unexpected error occurred."],
          propertyResults,
          errorData?.exception || error.message,
          "Unknown"
        );
        showErrorToast(statusCode, result.messages, propertyResults);
        return Promise.reject(result);
      }
    }
  }
);

// Server-side API client that accepts token
export function createServerApiClient(token?: string) {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    timeout: 30000,
  });

  return client;
}

export default apiClient;
