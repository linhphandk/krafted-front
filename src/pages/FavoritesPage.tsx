import { useState } from "react"
import { Link } from "react-router"
import { keepPreviousData } from "@tanstack/react-query"
import { Badge, Box, Button, Callout, Flex, Heading, Spinner, Table, Text } from "@radix-ui/themes"
import { useListFavorites } from "@/api/generated"
import Pagination from "@/components/Pagination"

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
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
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell style={{ width: 60 }}>Image</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Seller</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Saved on</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {items.map((fav) => (
                <Table.Row key={fav.id}>
                  <Table.Cell>
                    {fav.image_url ? (
                      <img
                        src={fav.image_url}
                        alt=""
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "var(--radius-2)" }}
                      />
                    ) : (
                      <Box
                        style={{ width: 40, height: 40, background: "var(--gray-a3)", borderRadius: "var(--radius-2)" }}
                      />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/listings/${fav.listing_id}`} style={{ textDecoration: "none" }}>
                      <Text weight="medium">{fav.title}</Text>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{formatPrice(fav.price_cents)}</Table.Cell>
                  <Table.Cell>
                    <Text size="2">{fav.seller_name}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge size="1" color={fav.status === "Active" ? "green" : "gray"}>
                      {fav.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{formatDate(fav.created_at)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </Flex>
  )
}

export default FavoritesPage
