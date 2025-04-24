// src/components/ui/sonner.tsx
import { Toaster as SonnerToaster, toast as sonnerToast, type ToasterProps as SonnerProps } from "sonner"
import { useTheme } from "next-themes"
import React from "react"

// Re-export Sonner's `toast(...)` function
export const toast = sonnerToast

// Wrapper around Sonner's <Toaster /> to inject theming + styles
export const Toaster: React.FC<SonnerProps> = props => {
  const { theme = "system" } = useTheme()

  return (
    <SonnerToaster
      theme={theme as SonnerProps["theme"]}
      position="top-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group bg-background text-foreground border border-border shadow-lg animate-fade-in",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}
