"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// next-themes renders an inline <script> to set the theme class before
// hydration (this is what prevents a flash of the wrong theme). React 19
// added a dev-only warning for any <script> rendered inside a component,
// which fires here even though the script runs correctly during SSR —
// this is a known false positive (next-themes hasn't shipped a fix; see
// https://github.com/pacocoursey/next-themes/issues/387). Silencing just
// this one message in development so it doesn't show as a red error
// overlay; nothing else is affected.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
