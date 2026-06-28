import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { keepPreviousData, useQueryClient } from "@tanstack/react-query"
import {
  Box,
  Button,
  Callout,
  Flex,
  Heading,
  Spinner,
  Badge,
  Table,
  Text,
} from "@radix-ui/themes"
import {
  useSellerListings,
  usePublishListing,
  usePauseListing,
  useDeleteListing,
  getSellerListingsQueryKey,
} from "@/api/generated"
import type { SellerListingsParams } from "@/api/generated"
import Pagination from "@/components/Pagination"

const STATUS_OPTIONS = ["All", "Draft", "Active", "Paused"] as const

const STATUS_BADGE_COLORS: Record<string, "gray" | "green" | "amber" | "red"> = {
  Draft: "gray",
  Active: "green",
  Paused: "amber",
  Closed: "red",
}

type ListingStatus = (typeof STATUS_OPTIONS)[number]

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}

const MyListingsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<ListingStatus>("All")

  const params = {
    page,
    per_page: 12,
    ...(statusFilter !== "All" ? { status: statusFilter.toLowerCase() } : {}),
  } as SellerListingsParams & { status?: string }

  const { data, isFetching, isError } = useSellerListings(params, {
    query: { placeholderData: keepPreviousData },
  })

  const publishListing = usePublishListing({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getSellerListingsQueryKey() }),
    },
  })
  const pauseListing = usePauseListing({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getSellerListingsQueryKey() }),
    },
  })
  const deleteListing = useDeleteListing({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getSellerListingsQueryKey() }),
    },
  })

  function handleStatusChange(status: ListingStatus) {
    setStatusFilter(status)
    setPage(1)
  }

  async function handlePublish(id: string) {
    try {
      await publishListing.mutateAsync({ id })
    } catch {
      // handled by error state
    }
  }

  async function handlePause(id: string) {
    try {
      await pauseListing.mutateAsync({ id })
    } catch {
      // handled by error state
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this listing?")) return
    try {
      await deleteListing.mutateAsync({ id })
    } catch {
      // handled by error state
    }
  }

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
          <Callout.Text>Failed to load your listings</Callout.Text>
        </Callout.Root>
      </Flex>
    )
  }

  const listings = data?.items || []
  const totalPages = data?.total_pages || 1

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center">
        <Heading size="6">My listings</Heading>
        <Button onClick={() => navigate("/listings/new")}>Create listing</Button>
      </Flex>

      <Flex gap="2">
        {STATUS_OPTIONS.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "solid" : "soft"}
            size="1"
            onClick={() => handleStatusChange(status)}
          >
            {status}
          </Button>
        ))}
      </Flex>

      {listings.length === 0 ? (
        <Flex direction="column" align="center" gap="3" style={{ minHeight: "20vh" }} justify="center">
          <Callout.Root color="gray" size="1">
            <Callout.Text>
              {statusFilter === "All" ? "No listings yet" : `No ${statusFilter.toLowerCase()} listings`}
            </Callout.Text>
          </Callout.Root>
          {statusFilter === "All" && (
            <Button onClick={() => navigate("/listings/new")}>Create your first listing</Button>
          )}
        </Flex>
      ) : (
        <>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell style={{ width: 60 }}>Image</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Qty</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {listings.map((listing) => (
                <Table.Row key={listing.id}>
                  <Table.Cell>
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0].thumbnail_url || listing.images[0].url}
                        alt=""
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "var(--radius-2)" }}
                      />
                    ) : (
                      <Box style={{ width: 40, height: 40, background: "var(--gray-a3)", borderRadius: "var(--radius-2)" }} />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/listings/${listing.id}`} style={{ textDecoration: "none" }}>
                      <Text weight="medium">{listing.title}</Text>
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{formatPrice(listing.price_cents)}</Table.Cell>
                  <Table.Cell>
                    <Badge size="1" color={STATUS_BADGE_COLORS[listing.status] || "gray"}>
                      {listing.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{listing.quantity}</Table.Cell>
                  <Table.Cell>{formatDate(listing.created_at)}</Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      {listing.status === "Draft" && (
                        <Button size="1" variant="soft" onClick={() => handlePublish(listing.id)}>
                          Publish
                        </Button>
                      )}
                      {listing.status === "Active" && (
                        <Button size="1" variant="soft" onClick={() => handlePause(listing.id)}>
                          Pause
                        </Button>
                      )}
                      {listing.status === "Paused" && (
                        <Button size="1" variant="soft" onClick={() => handlePublish(listing.id)}>
                          Publish
                        </Button>
                      )}
                      <Button size="1" variant="soft" onClick={() => navigate(`/listings/${listing.id}/edit`)}>
                        Edit
                      </Button>
                      <Button size="1" variant="soft" color="red" onClick={() => handleDelete(listing.id)}>
                        Delete
                      </Button>
                    </Flex>
                  </Table.Cell>
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

export default MyListingsPage
