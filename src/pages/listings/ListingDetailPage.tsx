import { useParams, Link } from "react-router"
import { Card, Flex, Heading, Text, Badge, Spinner, Callout } from "@radix-ui/themes"
import { useGetListing } from "@/api/generated"

const CONDITION_COLORS: Record<string, "purple" | "green" | "orange" | "blue"> = {
  Handmade: "purple",
  New: "green",
  Vintage: "orange",
  Refurbished: "blue",
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: listing, isLoading } = useGetListing(id!)

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "40vh" }}>
        <Spinner size="3" aria-label="Loading" />
      </Flex>
    )
  }

  if (!listing) {
    return (
      <Flex direction="column" align="center" gap="3" style={{ minHeight: "40vh" }} justify="center">
        <Callout.Root color="red" size="1">
          <Callout.Text>Failed to load listing</Callout.Text>
        </Callout.Root>
        <Link to="/listings">Back to listings</Link>
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="4" style={{ maxWidth: 640 }}>
      <Link to="/listings">
        <Text size="2" color="gray">&larr; Back to listings</Text>
      </Link>

      <Heading size="8">{listing.title}</Heading>

      <Flex gap="2" align="center">
        <Badge size="2" color={CONDITION_COLORS[listing.condition] || "gray"}>
          {listing.condition}
        </Badge>
        {listing.category_name && (
          <Badge size="2" variant="soft">{listing.category_name}</Badge>
        )}
      </Flex>

      <Text size="6" weight="bold">{formatPrice(listing.price_cents)}</Text>

      <Card size="2">
        <Text size="3" style={{ whiteSpace: "pre-wrap" }}>
          {listing.description}
        </Text>
      </Card>

      <Text size="2" color="gray">
        {listing.quantity} available &middot; Listed by {listing.seller_name || listing.seller_id}
      </Text>
    </Flex>
  )
}

export default ListingDetailPage
