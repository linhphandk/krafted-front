import { Flex, Button, Text } from "@radix-ui/themes"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  return (
    <Flex align="center" justify="center" gap="3">
      <Button
        variant="soft"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        style={{ cursor: page <= 1 ? "not-allowed" : "pointer" }}
      >
        Previous
      </Button>
      <Text size="2">
        Page {page} of {totalPages}
      </Text>
      <Button
        variant="soft"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        style={{ cursor: page >= totalPages ? "not-allowed" : "pointer" }}
      >
        Next
      </Button>
    </Flex>
  )
}

export default Pagination
