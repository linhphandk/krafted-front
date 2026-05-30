import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Theme } from "@radix-ui/themes"
import "@radix-ui/themes/styles.css"
import "@radix-ui/themes/typography.css"
import "./index.css"
import App from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme accentColor="iris" radius="medium" scaling="100%">
      <App />
    </Theme>
  </StrictMode>,
)
