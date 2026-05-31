import { Card, Flex, Heading, Text, Badge } from "@radix-ui/themes"
import { Link } from "react-router"

const CONDITION_COLORS: Record<string, "purple" | "green" | "orange" | "blue"> = {
  Handmade: "purple",
  New: "green",
  Vintage: "orange",
  Refurbished: "blue",
}

interface ListingCardListing {
  id: string
  title: string
  price_cents: number
  condition: string
  category_name?: string | null
}

interface ListingCardProps {
  listing: ListingCardListing
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: "none" }}>
      <Card size="1">
        <Flex
          direction="column"
          gap="2"
          style={{ height: 200 }}
          align="center"
          justify="center"
        >
          <Text size="2" color="gray">No image</Text>
        </Flex>
        <Flex direction="column" gap="1" mt="2">
          <Heading size="3">{listing.title}</Heading>
          <Text size="4" weight="bold">{formatPrice(listing.price_cents)}</Text>
          <Flex gap="1" wrap="wrap">
            <Badge size="1" color={CONDITION_COLORS[listing.condition] || "gray"}>
              {listing.condition}
            </Badge>
            {listing.category_name && (
              <Badge size="1" variant="soft">{listing.category_name}</Badge>
            )}
          </Flex>
        </Flex>
      </Card>
    </Link>
  )
}

export default ListingCard
