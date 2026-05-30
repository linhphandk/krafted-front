import { useState } from "react"
import { Link } from "react-router"
import { useForm } from "react-hook-form"
import { Box, Card, TextField, Button, Text, Flex, Heading, Callout } from "@radix-ui/themes"

interface RegisterFormData {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
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
              <Box>
                <Text as="label" size="2" weight="medium">Display name</Text>
                <TextField.Root
                  placeholder="Jane Doe"
                  {...register("displayName", { required: "Display name is required" })}
                />
                {errors.displayName && (
                  <Text size="1" color="red">{errors.displayName.message}</Text>
                )}
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium">Email</Text>
                <TextField.Root
                  placeholder="you@example.com"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address" },
                  })}
                />
                {errors.email && (
                  <Text size="1" color="red">{errors.email.message}</Text>
                )}
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium">Password</Text>
                <TextField.Root
                  placeholder="••••••••"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                />
                {errors.password && (
                  <Text size="1" color="red">{errors.password.message}</Text>
                )}
              </Box>

              <Box>
                <Text as="label" size="2" weight="medium">Confirm password</Text>
                <TextField.Root
                  placeholder="••••••••"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === getValues("password") || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <Text size="1" color="red">{errors.confirmPassword.message}</Text>
                )}
              </Box>

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
