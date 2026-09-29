import { Button, Flex, HStack, NativeSelect, Text } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { formatCount } from './format.ts'

const PAGE_SIZES = [20, 50, 100]

export function PaginationBar({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}) {
  const pageCount = Math.max(1, Math.ceil(total / limit))
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
      <Text fontSize="sm" color="gray.600">
        Showing{' '}
        <Text as="span" fontWeight="medium" color="gray.900">
          {formatCount(start)}–{formatCount(end)}
        </Text>{' '}
        of{' '}
        <Text as="span" fontWeight="medium" color="gray.900">
          {formatCount(total)}
        </Text>
      </Text>
      <HStack gap={2}>
        <NativeSelect.Root size="sm" width="120px" bg="white">
          <NativeSelect.Field
            aria-label="Rows per page"
            value={String(limit)}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Button
          size="sm"
          variant="outline"
          bg="white"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        <Text fontSize="sm" color="gray.700" whiteSpace="nowrap" px={1}>
          Page {formatCount(page)} of {formatCount(pageCount)}
        </Text>
        <Button
          size="sm"
          variant="outline"
          bg="white"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </HStack>
    </Flex>
  )
}
