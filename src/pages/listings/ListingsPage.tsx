import { useState } from "react"
import { keepPreviousData } from "@tanstack/react-query"
import { Flex, Grid, Heading, Spinner, Callout } from "@radix-ui/themes"
import { useListListings, useListCategories } from "@/api/generated"
import type { ListListingsParams } from "@/api/generated"
import ListingCard from "@/components/ListingCard"
import ListingsFilter from "@/components/ListingsFilter"
import Pagination from "@/components/Pagination"

const ListingsPage = () => {
  const [filters, setFilters] = useState<ListListingsParams>({ page: 1, per_page: 12, status: "active" })
  const { data: listingsData, isFetching, error } = useListListings(filters, {
    query: { placeholderData: keepPreviousData },
  })
  const { data: categories } = useListCategories()

  if (!listingsData && isFetching) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "40vh" }}>
        <Spinner size="3" aria-label="Loading" />
      </Flex>
    )
  }

  if (error) {
    return (
      <Flex direction="column" align="center" gap="3" style={{ minHeight: "40vh" }} justify="center">
        <Callout.Root color="red" size="1">
          <Callout.Text>Failed to load listings</Callout.Text>
        </Callout.Root>
      </Flex>
    )
  }

  const listings = listingsData?.items || []
  const totalPages = listingsData?.total_pages || 1

  return (
    <Flex direction="column" gap="4">
      <Heading size="6">Browse listings</Heading>

      <Grid columns="250px 1fr" gap="4">
        <ListingsFilter
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories || []}
        />

        <Flex direction="column" gap="4">
          {listings.length === 0 ? (
            <Flex align="center" justify="center" style={{ minHeight: "20vh" }}>
              <Callout.Root color="gray" size="1">
                <Callout.Text>No listings found</Callout.Text>
              </Callout.Root>
            </Flex>
          ) : (
            <>
              <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </Grid>

              {totalPages > 1 && (
                <Pagination
                  page={filters.page || 1}
                  totalPages={totalPages}
                  onPageChange={(p) => setFilters({ ...filters, page: p })}
                />
              )}
            </>
          )}
        </Flex>
      </Grid>
    </Flex>
  )
}

export default ListingsPage
