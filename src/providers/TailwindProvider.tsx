"use client";

import React from "react";
import { PrimeReactProvider } from "primereact/api";
import { primeReactStyles } from "@/lib/primereact/primereactStyles";

type Props = {
  children: React.ReactNode;
};

export function TailwindProvider({ children }: Props) {
  return (
    <PrimeReactProvider
      value={{
        pt: primeReactStyles,
        unstyled: false,
        ripple: true,
        zIndex: {
          modal: 1100,
          overlay: 1000,
          menu: 1000,
          tooltip: 1100,
        },
      }}
    >
      {children}
    </PrimeReactProvider>
  );
}
