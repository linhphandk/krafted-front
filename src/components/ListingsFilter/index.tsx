import { useState, useCallback, useRef, useEffect } from "react"
import { Flex, Text, TextField, Button, Select, Dialog, RadioGroup } from "@radix-ui/themes"
import type { ListListingsParams } from "@/api/generated"
import type { Category } from "@/api/generated"

interface ListingsFilterProps {
  filters: ListListingsParams
  onFiltersChange: (filters: ListListingsParams) => void
  categories: Category[]
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low-High" },
  { value: "price_desc", label: "Price: High-Low" },
] as const

const ListingsFilter = ({ filters, onFiltersChange, categories }: ListingsFilterProps) => {
  const [searchValue, setSearchValue] = useState(filters.search || "")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setSearchValue(filters.search || "")
  }, [filters.search])

  const updateFilter = useCallback(
    (patch: Partial<ListListingsParams>) => {
      onFiltersChange({ ...filters, ...patch, page: 1 })
    },
    [filters, onFiltersChange],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        updateFilter({ search: value || undefined })
      }, 300)
    },
    [updateFilter],
  )

  const filteredCategories = filters.kind
    ? categories.filter((c) => c.kind === filters.kind)
    : categories

  const currentKind = filters.kind || "all"

  return (
    <Flex gap="2" align="center">
      <TextField.Root
        placeholder="Search listings..."
        value={searchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        style={{ flex: 1 }}
      />

      <Dialog.Root>
        <Dialog.Trigger>
          <Button variant="soft" style={{ cursor: "pointer" }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 2C4.567 2 3 3.567 3 5.5C3 7.433 4.567 9 6.5 9C7.348 9 8.135 8.738 8.777 8.313L11.532 11.068L12.068 10.532L9.313 7.777C9.738 7.135 10 6.348 10 5.5C10 3.567 8.433 2 6.5 2ZM4 5.5C4 4.119 5.119 3 6.5 3C7.881 3 9 4.119 9 5.5C9 6.881 7.881 8 6.5 8C5.119 8 4 6.881 4 5.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
            </svg>
            Filters
          </Button>
        </Dialog.Trigger>

        <Dialog.Content style={{ maxWidth: 400 }}>
          <Dialog.Title>Filters</Dialog.Title>
          <Flex direction="column" gap="3" mt="3">
            <Select.Root
              value={filters.category_id || "all"}
              onValueChange={(val) => updateFilter({ category_id: val === "all" ? undefined : val })}
            >
              <Select.Trigger placeholder="All categories" style={{ cursor: "pointer" }} />
              <Select.Content>
                <Select.Item value="all">All categories</Select.Item>
                {filteredCategories.map((cat) => (
                  <Select.Item key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Select.Root
              value={filters.sort || "newest"}
              onValueChange={(val) => updateFilter({ sort: val })}
            >
              <Select.Trigger placeholder="Sort by" style={{ cursor: "pointer" }} />
              <Select.Content>
                {SORT_OPTIONS.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Text size="2" weight="bold" mb="1">Type</Text>
            <RadioGroup.Root
              value={currentKind}
              onValueChange={(val: string) => updateFilter({ kind: val === "all" ? undefined : val })}
            >
              <Flex gap="2" direction="column">
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="all" style={{ cursor: "pointer" }} /> All
                  </Flex>
                </Text>
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="craft" style={{ cursor: "pointer" }} /> Crafts
                  </Flex>
                </Text>
                <Text as="label" size="2">
                  <Flex gap="2" align="center">
                    <RadioGroup.Item value="supply" style={{ cursor: "pointer" }} /> Supplies
                  </Flex>
                </Text>
              </Flex>
            </RadioGroup.Root>

            <Flex gap="2" justify="between">
              <Button
                variant="soft"
                style={{ cursor: "pointer" }}
                onClick={() => onFiltersChange({ page: 1, status: "active", per_page: 12 })}
              >
                Clear filters
              </Button>
              <Dialog.Close>
                <Button style={{ cursor: "pointer" }}>Close</Button>
              </Dialog.Close>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  )
}

export default ListingsFilter
