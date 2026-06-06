import React from "react"
import { Box, Button, Card, Flex, Heading, Text } from "@radix-ui/themes"
import type { ErrorReporter } from "./error-reporter"
import { ErrorReporterContext } from "./error-reporter"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode)
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static contextType = ErrorReporterContext
  declare context: ErrorReporter

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.context.report(error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error!, this.handleReset)
      }
      return this.props.fallback
    }

    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Card size="3" style={{ maxWidth: 420, width: "100%" }}>
          <Flex direction="column" gap="3" align="center" p="4">
            <Heading size="6" color="red">Something went wrong</Heading>
            <Text size="2" color="gray" align="center">
              An unexpected error occurred. Please try again.
            </Text>
            {this.state.error && (
              <Text size="1" color="gray" style={{ fontFamily: "monospace" }}>
                {this.state.error.message}
              </Text>
            )}
            <Box pt="2">
              <Button onClick={this.handleReset}>Try again</Button>
            </Box>
          </Flex>
        </Card>
      </Flex>
    )
  }
}

export default ErrorBoundary
