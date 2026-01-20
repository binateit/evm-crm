// src/styles/primereact/toast.ts
// Toast notification passthrough configuration

interface ToastMessage {
  severity?: "success" | "error" | "warn" | "info";
}

interface ToastState {
  message?: ToastMessage;
}

export const toast = {
  root: {
    className: "w-96",
  },
  container: {
    className: "rounded-lg shadow-lg overflow-hidden",
  },
  message: ({ state }: { state: ToastState }) => {
    const severity = state?.message?.severity;
    return {
      className: `flex items-center gap-3 px-4 py-3.5 bg-white border ${
        severity === "success"
          ? "border-l-4 border-l-green-500 border-y border-r border-gray-200"
          : severity === "error"
            ? "border-l-4 border-l-red-500 border-y border-r border-gray-200"
            : severity === "warn"
              ? "border-l-4 border-l-amber-500 border-y border-r border-gray-200"
              : "border-l-4 border-l-blue-500 border-y border-r border-gray-200"
      }`,
    };
  },
  messageIcon: ({ state }: { state: ToastState }) => {
    const severity = state?.message?.severity;
    return {
      className: `flex-shrink-0 w-5 h-5 ${
        severity === "success"
          ? "text-green-500"
          : severity === "error"
            ? "text-red-500"
            : severity === "warn"
              ? "text-amber-500"
              : "text-blue-500"
      }`,
    };
  },
  messageContent: {
    className: "flex-1 min-w-0 flex flex-col gap-0.5",
  },
  summary: {
    className: "font-semibold text-sm text-gray-900 leading-tight",
  },
  detail: {
    className: "text-sm text-gray-600 leading-tight",
  },
  closeButton: {
    className:
      "flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mr-1",
  },
  closeIcon: {
    className: "w-4 h-4",
  },
};
