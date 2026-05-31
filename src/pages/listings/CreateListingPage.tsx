import { useNavigate } from "react-router"
import { useForm, Controller } from "react-hook-form"
import {
  Box,
  Card,
  TextField,
  TextArea,
  Button,
  Text,
  Flex,
  Heading,
  Callout,
  Select,
  Switch,
} from "@radix-ui/themes"
import FormField from "@/components/FormField"

const CATEGORIES = [
  { value: "knitting", label: "Knitting" },
  { value: "crochet", label: "Crochet" },
  { value: "jewelry", label: "Jewelry" },
  { value: "pottery", label: "Pottery" },
  { value: "woodworking", label: "Woodworking" },
  { value: "sewing", label: "Sewing" },
  { value: "yarn", label: "Yarn" },
  { value: "fabric", label: "Fabric" },
  { value: "beads", label: "Beads" },
  { value: "tools", label: "Tools" },
] as const

const CONDITIONS = [
  { value: "handmade", label: "Handmade" },
  { value: "new", label: "New" },
  { value: "vintage", label: "Vintage" },
  { value: "refurbished", label: "Refurbished" },
] as const

interface CreateListingFormData {
  title: string
  description: string
  price: string
  category_id: string
  condition: string
  quantity: string
  is_active: boolean
}

const CreateListingPage = () => {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateListingFormData>({
    mode: "onChange",
    defaultValues: { quantity: "1", is_active: false },
  })

  async function onSubmit(_data: CreateListingFormData) {
    try {
      // TODO: replace with API call
      navigate("/listings")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create listing"
      setError("root", { message })
    }
  }

  const serverError = errors.root?.message

  return (
    <Flex justify="center">
      <Card size="2" style={{ width: 560 }}>
        <Flex direction="column" gap="4" p="4">
          <Heading size="5">Create listing</Heading>

          {serverError && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{serverError}</Callout.Text>
            </Callout.Root>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap="4">
              <FormField label="Title" error={errors.title?.message}>
                <TextField.Root
                  placeholder="Handmade ceramic vase"
                  {...register("title", { required: "Title is required" })}
                />
              </FormField>

              <FormField label="Description" error={errors.description?.message}>
                <TextArea
                  placeholder="Describe your item..."
                  {...register("description", { required: "Description is required" })}
                />
              </FormField>

              <Flex gap="3">
                <Box style={{ flex: 1 }}>
                  <FormField label="Price ($)" error={errors.price?.message}>
                    <TextField.Root
                      placeholder="19.99"
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...register("price", {
                        required: "Price is required",
                        min: { value: 0.01, message: "Price must be at least $0.01" },
                      })}
                    />
                  </FormField>
                </Box>
                <Box style={{ flex: 1 }}>
                  <FormField label="Quantity" error={errors.quantity?.message}>
                    <TextField.Root
                      type="number"
                      min="1"
                      {...register("quantity", {
                        required: "Quantity is required",
                        min: { value: 1, message: "Quantity must be at least 1" },
                      })}
                    />
                  </FormField>
                </Box>
              </Flex>

              <Flex gap="3">
                <Box style={{ flex: 1 }}>
                  <Controller
                    name="category_id"
                    control={control}
                    rules={{ required: "Category is required" }}
                    render={({ field }) => (
                      <FormField label="Category" error={errors.category_id?.message}>
                        <Select.Root value={field.value} onValueChange={field.onChange}>
                          <Select.Trigger placeholder="Select category" />
                          <Select.Content>
                            {CATEGORIES.map((c) => (
                              <Select.Item key={c.value} value={c.value}>
                                {c.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </FormField>
                    )}
                  />
                </Box>
                <Box style={{ flex: 1 }}>
                  <Controller
                    name="condition"
                    control={control}
                    rules={{ required: "Condition is required" }}
                    render={({ field }) => (
                      <FormField label="Condition" error={errors.condition?.message}>
                        <Select.Root value={field.value} onValueChange={field.onChange}>
                          <Select.Trigger placeholder="Select condition" />
                          <Select.Content>
                            {CONDITIONS.map((c) => (
                              <Select.Item key={c.value} value={c.value}>
                                {c.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </FormField>
                    )}
                  />
                </Box>
              </Flex>

              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Flex align="center" gap="2">
                    <Text size="2">Draft</Text>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                    <Text size="2">Active</Text>
                  </Flex>
                )}
              />

              <Flex gap="3" justify="end">
                <Button variant="soft" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Create listing
                </Button>
              </Flex>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Flex>
  )
}

export default CreateListingPage
