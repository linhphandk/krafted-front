import { useCallback, useRef } from "react"
import { Flex, TextField, Button, Select, Tabs } from "@radix-ui/themes"
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const updateFilter = useCallback(
    (patch: Partial<ListListingsParams>) => {
      onFiltersChange({ ...filters, ...patch, page: 1 })
    },
    [filters, onFiltersChange],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
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
    <Flex direction="column" gap="3">
      <Tabs.Root
        value={currentKind}
        onValueChange={(val) => updateFilter({ kind: val === "all" ? undefined : val })}
      >
        <Tabs.List>
          <Tabs.Trigger value="all">All</Tabs.Trigger>
          <Tabs.Trigger value="craft">Crafts</Tabs.Trigger>
          <Tabs.Trigger value="supply">Supplies</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      <TextField.Root
        placeholder="Search listings..."
        defaultValue={filters.search}
        onChange={(e) => handleSearchChange(e.target.value)}
      />

      <Select.Root
        value={filters.category_id || "all"}
        onValueChange={(val) => updateFilter({ category_id: val === "all" ? undefined : val })}
      >
        <Select.Trigger placeholder="All categories" />
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
        <Select.Trigger placeholder="Sort by" />
        <Select.Content>
          {SORT_OPTIONS.map((opt) => (
            <Select.Item key={opt.value} value={opt.value}>
              {opt.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <Button
        variant="soft"
        onClick={() => onFiltersChange({ page: 1, status: "active", per_page: 12 })}
      >
        Clear filters
      </Button>
    </Flex>
  )
}

export default ListingsFilter
