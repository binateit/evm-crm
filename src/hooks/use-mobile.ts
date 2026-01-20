"use client";

import { useState, useEffect, useTransition } from "react";

const MOBILE_BREAKPOINT = 1024; // lg breakpoint

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      startTransition(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      });
    };
    mql.addEventListener("change", onChange);
    startTransition(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    });
    return () => mql.removeEventListener("change", onChange);
  }, [startTransition]);

  return !!isMobile;
}
