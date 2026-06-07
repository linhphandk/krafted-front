import { useParams, Link, useNavigate } from "react-router"
import { Button, Card, Flex, Heading, Text, Badge, Spinner, Callout } from "@radix-ui/themes"
import { useGetListing, useAddFavorite, useRemoveFavorite, getListFavoritesQueryKey, useListFavorites } from "@/api/generated"
import { useAuth } from "@/context"
import { useQueryClient } from "@tanstack/react-query"

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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data: listing, isLoading } = useGetListing(id!)
  const { data: favData } = useListFavorites({ per_page: 100 })
  const isOwner = user?.id === listing?.seller_id

  const isFavorited = favData?.items?.some((f) => f.listing_id === id) ?? false

  const addFav = useAddFavorite({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() }) },
  })
  const removeFav = useRemoveFavorite({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() }) },
  })

  async function toggleFavorite() {
    if (isFavorited) {
      await removeFav.mutateAsync({ listingId: id! })
    } else {
      await addFav.mutateAsync({ listingId: id! })
    }
  }

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

      <Flex justify="between" align="start">
        <Flex direction="column" gap="2">
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
        </Flex>

        {!isOwner && (
          <Button
            size="3"
            variant={isFavorited ? "solid" : "soft"}
            color={isFavorited ? "red" : "gray"}
            onClick={toggleFavorite}
            loading={addFav.isPending || removeFav.isPending}
          >
            {isFavorited ? "♥ Saved" : "♡ Save"}
          </Button>
        )}
      </Flex>

      {listing.images && listing.images.length > 0 && (
        <Flex gap="2" wrap="wrap">
          {listing.images.map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt={listing.title}
              style={{ width: 200, height: 200, objectFit: "cover", borderRadius: "var(--radius-2)" }}
            />
          ))}
        </Flex>
      )}

      {isOwner && (
        <Flex gap="2">
          <Button onClick={() => navigate(`/listings/${listing.id}/edit`)}>Edit</Button>
        </Flex>
      )}

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
