import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Box, Card, TextField, Button, Flex, Heading, Callout } from "@radix-ui/themes"
import { useAuth } from "@/context"
import { updateProfile } from "@/api/generated"
import FormField from "@/components/FormField"

interface ProfileFormData {
  name: string
  email: string
}

const ProfilePage = () => {
  const { user, refreshUser } = useAuth()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm<ProfileFormData>({ mode: "onChange" })

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email })
  }, [user, reset])

  async function onSubmit(data: ProfileFormData) {
    setSuccess(false)
    try {
      await updateProfile({ name: data.name, email: data.email })
      await refreshUser()
      setSuccess(true)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { error?: string })?.error || "Failed to update profile"
      setError("root", { message })
    }
  }

  const serverError = errors.root?.message

  return (
    <Box style={{ maxWidth: 500, margin: "0 auto" }}>
      <Card size="2">
        <Flex direction="column" gap="4" p="4">
          <Heading size="5">Profile</Heading>

          {success && (
            <Callout.Root color="green" size="1">
              <Callout.Text>Profile updated successfully.</Callout.Text>
            </Callout.Root>
          )}

          {serverError && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{serverError}</Callout.Text>
            </Callout.Root>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap="3">
              <FormField label="Name" error={errors.name?.message}>
                <TextField.Root
                  placeholder="Your name"
                  {...register("name", { required: "Name is required" })}
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

              <Button type="submit" loading={isSubmitting} disabled={!isDirty} size="3">
                Save
              </Button>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Box>
  )
}

export default ProfilePage
