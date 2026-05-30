import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Theme } from "@radix-ui/themes"
import "@radix-ui/themes/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/context"

import "./index.css"
import App from "./App"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Theme accentColor="iris" radius="medium" scaling="100%">
        <AuthProvider>
          <App />
        </AuthProvider>
      </Theme>
    </QueryClientProvider>
  </StrictMode>,
)
