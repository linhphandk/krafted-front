import { render, type RenderOptions } from "@testing-library/react"
import { BrowserRouter } from "react-router"
import { Theme } from "@radix-ui/themes"
import "@radix-ui/themes/styles.css"
import type { ReactElement } from "react"

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <Theme accentColor="iris" radius="medium">
        {children}
      </Theme>
    </BrowserRouter>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from "@testing-library/react"
export { renderWithProviders as render }