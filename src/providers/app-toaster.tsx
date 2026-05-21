"use client";

import { Toaster } from "sonner";
import "sonner/dist/styles.css";

/** Global toast host — mount once in root layout. */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      duration={5000}
      gap={12}
      visibleToasts={4}
      toastOptions={{
        classNames: {
          toast:
            "font-sans border border-primary-blue/15 bg-white text-foreground shadow-md",
          title: "font-medium text-primary-blue",
          description: "text-muted-foreground text-sm",
          closeButton:
            "border-primary-blue/15 bg-white text-primary-blue hover:bg-blue-gray/50",
        },
      }}
    />
  );
}
