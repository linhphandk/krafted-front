import React from "react"

export interface ErrorReporter {
  report(error: Error, info: React.ErrorInfo): void
}

export const consoleReporter: ErrorReporter = {
  report(error: Error, info: React.ErrorInfo) {
    console.log("[ErrorBoundary]", error, info)
  },
}

export const ErrorReporterContext = React.createContext<ErrorReporter>(consoleReporter)

export function useErrorReporter(): ErrorReporter {
  return React.useContext(ErrorReporterContext)
}

export function ErrorReporterProvider({
  reporter,
  children,
}: {
  reporter: ErrorReporter
  children: React.ReactNode
}) {
  return (
    <ErrorReporterContext.Provider value={reporter}>
      {children}
    </ErrorReporterContext.Provider>
  )
}
