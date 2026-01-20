"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { ThemeProvider } from "./ThemeProvider";
import { TailwindProvider } from "./TailwindProvider";
import { ToastProvider } from "@/lib/contexts/toast-context";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <TailwindProvider>
            <ToastProvider>{children}</ToastProvider>
          </TailwindProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
