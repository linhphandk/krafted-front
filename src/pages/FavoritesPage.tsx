import { useState } from "react"
import { Link } from "react-router"
import { keepPreviousData } from "@tanstack/react-query"
import { Button, Callout, Card, Flex, Grid, Heading, Spinner, Text } from "@radix-ui/themes"
import { useListFavorites } from "@/api/generated"
import Pagination from "@/components/Pagination"

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

const FavoritesPage = () => {
  const [page, setPage] = useState(1)

  const { data, isFetching, isError } = useListFavorites(
    { page, per_page: 12 },
    { query: { placeholderData: keepPreviousData } },
  )

  if (!data && isFetching) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "40vh" }}>
        <Spinner size="3" aria-label="Loading" />
      </Flex>
    )
  }

  if (isError) {
    return (
      <Flex direction="column" align="center" gap="3" style={{ minHeight: "40vh" }} justify="center">
        <Callout.Root color="red" size="1">
          <Callout.Text>Failed to load favorites</Callout.Text>
        </Callout.Root>
        <Link to="/listings">Browse listings</Link>
      </Flex>
    )
  }

  const items = data?.items || []
  const totalPages = data?.total_pages || 1

  return (
    <Flex direction="column" gap="4">
      <Heading size="6">Saved listings</Heading>

      {items.length === 0 ? (
        <Flex direction="column" align="center" gap="3" style={{ minHeight: "20vh" }} justify="center">
          <Callout.Root color="gray" size="1">
            <Callout.Text>No saved listings yet</Callout.Text>
          </Callout.Root>
          <Link to="/listings">
            <Button variant="soft">Browse listings</Button>
          </Link>
        </Flex>
      ) : (
        <>
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            {items.map((fav) => (
              <Link key={fav.id} to={`/listings/${fav.listing_id}`} style={{ textDecoration: "none" }}>
                <Card size="1">
                  <Flex
                    direction="column"
                    gap="2"
                    style={{ height: 200 }}
                    align="center"
                    justify="center"
                  >
                    {fav.image_url ? (
                      <img
                        src={fav.image_url}
                        alt={fav.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-2)" }}
                      />
                    ) : (
                      <Text size="2" color="gray">No image</Text>
                    )}
                  </Flex>
                  <Flex direction="column" gap="1" mt="2">
                    <Heading size="3">{fav.title}</Heading>
                    <Text size="4" weight="bold">{formatPrice(fav.price_cents)}</Text>
                    <Text size="2" color="gray">{fav.seller_name}</Text>
                  </Flex>
                </Card>
              </Link>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </Flex>
  )
}

export default FavoritesPage
