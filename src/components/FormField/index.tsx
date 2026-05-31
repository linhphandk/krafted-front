import { Box, Text } from "@radix-ui/themes"

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

const FormField = ({ label, error, children }: FormFieldProps) => {
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

export default FormField
