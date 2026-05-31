import { Link, useNavigate, useLocation } from "react-router"
import type { Location } from "react-router"
import { useForm } from "react-hook-form"
import { Box, Card, TextField, Button, Text, Flex, Heading, Callout } from "@radix-ui/themes"
import { useAuth } from "@/context"
import FormField from "@/components/FormField"

interface LoginFormData {
  email: string
  password: string
}

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({ mode: "onChange" })

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : (err as { error?: string })?.error || "Login failed"
      setError("root", { message })
    }
  }

  const serverError = errors.root?.message

  return (
    <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card size="2" style={{ width: 400 }}>
        <Flex direction="column" gap="4" p="4">
          <Heading size="5" align="center">Sign in</Heading>

          {serverError && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{serverError}</Callout.Text>
            </Callout.Root>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap="3">
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
                  })}
                />
              </FormField>

              <Button type="submit" loading={isSubmitting} size="3">
                Sign in
              </Button>
            </Flex>
          </form>

          <Text size="2" align="center">
            Don't have an account?{" "}
            <Link to="/register">
              <Text color="iris">Create one</Text>
            </Link>
          </Text>
        </Flex>
      </Card>
    </Box>
  )
}

export default LoginPage
