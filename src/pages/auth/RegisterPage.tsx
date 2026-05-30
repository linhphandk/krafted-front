import { Link, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { Box, Card, TextField, Button, Text, Flex, Heading, Callout } from "@radix-ui/themes"
import { useRegister } from "@/api/generated"
import { setAccessToken } from "@/utils"
import FormField from "@/components/FormField"

interface RegisterFormData {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

const RegisterPage = () => {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({ mode: "onChange" })

  async function onSubmit(data: RegisterFormData) {
    try {
      const response = await registerMutation.mutateAsync({ data: { email: data.email, name: data.displayName, password: data.password } })
      if (!response?.access_token || !response?.expires_in) {
        setError("root", { message: "Invalid response from server" })
        return
      }
      setAccessToken(response.access_token, response.expires_in)
      navigate("/dashboard")
    } catch (err) {
      const message = err instanceof Error ? err.message : (err as { error?: string })?.error || "Registration failed"
      setError("root", { message })
    }
  }

  const serverError = errors.root?.message

  return (
    <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card size="2" style={{ width: 400 }}>
        <Flex direction="column" gap="4" p="4">
          <Heading size="5" align="center">Create account</Heading>

          {serverError && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{serverError}</Callout.Text>
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

              <Button type="submit" loading={isSubmitting || registerMutation.isPending} size="3">
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
