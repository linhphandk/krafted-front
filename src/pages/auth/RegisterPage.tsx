import { useState } from "react"
import { Link } from "react-router"
import { useForm } from "react-hook-form"
import { Box, Card, TextField, Button, Text, Flex, Heading, Callout } from "@radix-ui/themes"
import FormField from "@/components/FormField"

interface RegisterFormData {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ mode: "onChange" })

  const [error, setError] = useState<string | null>(null)

  async function onSubmit() {
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch {
      setError("Registration failed")
    }
  }

  return (
    <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card size="2" style={{ width: 400 }}>
        <Flex direction="column" gap="4" p="4">
          <Heading size="5" align="center">Create account</Heading>

          {error && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap="3">
              <FormField label="Display name" error={errors.displayName?.message}>
                <TextField.Root
                  placeholder="Jane Doe"
                  {...register("displayName", { required: "Display name is required" })}
                />
              </FormField>

              <FormField label="Email" error={errors.email?.message}>
                <TextField.Root
                  placeholder="you@example.com"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address" },
                  })}
                />
              </FormField>

              <FormField label="Password" error={errors.password?.message}>
                <TextField.Root
                  placeholder="••••••••"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                />
              </FormField>

              <FormField label="Confirm password" error={errors.confirmPassword?.message}>
                <TextField.Root
                  placeholder="••••••••"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === getValues("password") || "Passwords do not match",
                  })}
                />
              </FormField>

              <Button type="submit" loading={isSubmitting} size="3">
                Create account
              </Button>
            </Flex>
          </form>

          <Text size="2" align="center">
            Already have an account?{" "}
            <Link to="/login">
              <Text color="iris">Sign in</Text>
            </Link>
          </Text>
        </Flex>
      </Card>
    </Box>
  )
}

export default RegisterPage
