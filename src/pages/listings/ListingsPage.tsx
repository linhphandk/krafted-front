import { Flex, Grid, Heading, Spinner, Callout } from "@radix-ui/themes"
import { useListListings } from "@/api/generated"
import ListingCard from "@/components/ListingCard"

const ListingsPage = () => {
  const { data: listingsData, isLoading, error } = useListListings()

  if (isLoading) {
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

  if (listings.length === 0) {
    return (
      <Flex direction="column" gap="4" align="center" style={{ minHeight: "40vh" }} justify="center">
        <Heading size="6">Browse listings</Heading>
        <Callout.Root color="gray" size="1">
          <Callout.Text>No listings found</Callout.Text>
        </Callout.Root>
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="4">
      <Heading size="6">Browse listings</Heading>

      <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </Grid>
    </Flex>
  )
}

export default ListingsPage
