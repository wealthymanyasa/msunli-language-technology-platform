"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { useThemeStore } from "@/store/theme"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delay={200}>
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" theme={theme} closeButton richColors />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
