"use client";

import { createContext, useContext, useRef, ReactNode } from "react";
import { Toast } from "primereact/toast";
import type { Toast as ToastRef } from "primereact/toast";

interface ToastContextValue {
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warn: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  // Aliases for compatibility
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastRef = useRef<ToastRef>(null);

  const show = (
    severity: "success" | "error" | "warn" | "info",
    message: string,
    title?: string,
    duration = 3000
  ) => {
    toastRef.current?.show({
      severity,
      summary: title || severity.charAt(0).toUpperCase() + severity.slice(1),
      detail: message,
      life: duration,
    });
  };

  const successFn = (message: string, title?: string, duration?: number) =>
    show("success", message, title, duration);
  const errorFn = (message: string, title?: string, duration?: number) =>
    show("error", message, title, duration);

  const value: ToastContextValue = {
    success: successFn,
    error: errorFn,
    warn: (message, title, duration) => show("warn", message, title, duration),
    info: (message, title, duration) => show("info", message, title, duration),
    // Aliases
    showSuccess: successFn,
    showError: errorFn,
  };

  return (
    <ToastContext.Provider value={value}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
