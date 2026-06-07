import { useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { useForm, Controller } from "react-hook-form"
import {
  Badge,
  Box,
  Card,
  TextField,
  TextArea,
  Button,
  Flex,
  Heading,
  Callout,
  Select,
  Spinner,
} from "@radix-ui/themes"
import FormField from "@/components/FormField"
import { useGetListing, useUpdateListing, useListCategories } from "@/api/generated"
import type { UpdateListingRequest } from "@/api/generated"

const CONDITIONS = [
  { value: "Handmade", label: "Handmade" },
  { value: "New", label: "New" },
  { value: "Vintage", label: "Vintage" },
  { value: "Refurbished", label: "Refurbished" },
] as const

const STATUS_BADGE_COLORS: Record<string, "gray" | "green" | "amber" | "red"> = {
  Draft: "gray",
  Active: "green",
  Paused: "amber",
  Closed: "red",
}

const STATUS_OPTIONS = [
  { value: "Draft", label: "Draft" },
  { value: "Active", label: "Active" },
  { value: "Paused", label: "Paused" },
] as const

interface EditListingFormData {
  title: string
  description: string
  price: string
  category_id: string
  condition: string
  quantity: string
  status: string
}

const EditListingPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: listing, isLoading: isListingLoading, isError: isListingError } = useGetListing(id!)
  const updateListing = useUpdateListing()
  const { data: categories } = useListCategories()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<EditListingFormData>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category_id: "",
      condition: "",
      quantity: "1",
      status: "",
    },
  })

  useEffect(() => {
    if (!listing) return
    reset({
      title: listing.title,
      description: listing.description,
      price: (listing.price_cents / 100).toFixed(2),
      category_id: listing.category_id,
      condition: listing.condition,
      quantity: String(listing.quantity),
      status: listing.status,
    })
  }, [listing, reset])

  async function onSubmit(data: EditListingFormData) {
    try {
      const payload: UpdateListingRequest = {
        title: data.title,
        description: data.description,
        price_cents: Math.round(parseFloat(data.price) * 100),
        category_id: data.category_id,
        condition: data.condition,
        quantity: parseInt(data.quantity, 10),
        status: data.status,
      }
      await updateListing.mutateAsync({ id: id!, data: payload })
      navigate(`/listings/${id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : (err as { error?: string })?.error || "Failed to update listing"
      setError("root", { message })
    }
  }

  if (isListingLoading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "40vh" }}>
        <Spinner size="3" aria-label="Loading" />
      </Flex>
    )
  }

  if (isListingError || !listing) {
    return (
      <Flex direction="column" align="center" gap="3" style={{ minHeight: "40vh" }} justify="center">
        <Callout.Root color="red" size="1">
          <Callout.Text>Failed to load listing</Callout.Text>
        </Callout.Root>
        <Button variant="soft" onClick={() => navigate("/listings/mine")}>Back to my listings</Button>
      </Flex>
    )
  }

  const serverError = errors.root?.message

  return (
    <Flex justify="center">
      <Card size="2" style={{ width: 560 }}>
        <Flex direction="column" gap="4" p="4">
          <Flex align="center" gap="2">
            <Heading size="5">Edit listing</Heading>
            <Badge size="1" color={STATUS_BADGE_COLORS[listing.status] || "gray"}>
              {listing.status}
            </Badge>
          </Flex>

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
                            {(categories ?? []).map((c) => (
                              <Select.Item key={c.id} value={c.id}>
                                {c.name}
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
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <FormField label="Status" error={errors.status?.message}>
                    <Select.Root value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger placeholder="Select status" />
                      <Select.Content>
                        {STATUS_OPTIONS.map((s) => (
                          <Select.Item key={s.value} value={s.value}>
                            {s.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </FormField>
                )}
              />

              <Flex gap="3" justify="end">
                <Button variant="soft" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Save changes
                </Button>
              </Flex>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Flex>
  )
}

export default EditListingPage
