import { useState, useMemo } from "react"
import { keepPreviousData, useQueries } from "@tanstack/react-query"
import { Flex, Grid, Heading, Spinner, Callout } from "@radix-ui/themes"
import { useListListings, useListCategories, listImages } from "@/api/generated"
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

  const listings = listingsData?.items || []
  const totalPages = listingsData?.total_pages || 1

  const imageQueries = useQueries({
    queries: listings.map((listing) => ({
      queryKey: ["listings", listing.id, "images"],
      queryFn: () => listImages(listing.id),
      staleTime: 5 * 60 * 1000,
    })),
  })

  const imagesByListingId = useMemo(() => {
    const map = new Map<string, { url: string }[]>()
    listings.forEach((listing, i) => {
      const data = imageQueries[i]?.data
      if (data) {
        map.set(listing.id, data.map((img) => ({ url: img.url })))
      }
    })
    return map
  }, [listings, imageQueries])

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

  return (
    <Flex direction="column" gap="4">
      <Heading size="6">Browse listings</Heading>

      <ListingsFilter
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories || []}
      />

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
              <ListingCard
                key={listing.id}
                listing={{ ...listing, images: imagesByListingId.get(listing.id) }}
              />
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
  )
}

export default ListingsPage
