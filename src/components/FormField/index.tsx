import { Box, Text, TextField } from "@radix-ui/themes"

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactElement<typeof TextField.Root>
}

export default function FormField({ label, error, children }: FormFieldProps) {
  return (
    <Box>
      <Text as="label" size="2" weight="medium">{label}</Text>
      {children}
      {error && (
        <Text size="1" color="red">{error}</Text>
      )}
    </Box>
  )
}
