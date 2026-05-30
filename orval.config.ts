import { defineConfig } from "orval"

export default defineConfig({
  krafted: {
    input: "api/openapi.json",
    output: {
      target: "src/api/generated.ts",
      client: "react-query",
      httpClient: "fetch",
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        operations: {
          create_user: {
            mutation: true,
          },
        },
      },
      prettier: true,
    },
  },
})