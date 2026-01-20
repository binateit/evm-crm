"use client";

import { useEffect } from "react";

export function useBodyClass(className: string) {
  useEffect(() => {
    const classList = className.split(/\s+/).filter(Boolean);

    classList.forEach((className) => {
      document.body.classList.add(className);
    });

    return () => {
      classList.forEach((className) => {
        document.body.classList.remove(className);
      });
    };
  }, [className]);
}
