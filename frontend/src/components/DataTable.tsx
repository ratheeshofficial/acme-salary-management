import { Box, Button, Table } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import type { SortOrder } from '../features/employees/employeeQuery.ts'

export type DataColumn<T> = {
  key: string
  header: string
  sortKey?: string
  align?: 'start' | 'end'
  render: (row: T) => ReactNode
}

const headerLabel = {
  h: 'auto',
  minW: '0',
  px: 0,
  py: 0,
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wider',
  textTransform: 'uppercase',
  color: 'gray.600',
  borderRadius: 'none',
  _hover: { bg: 'transparent', color: 'blue.700' },
} as const

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  sortBy,
  sortOrder,
  onSort,
  footer,
}: {
  columns: DataColumn<T>[]
  rows: T[]
  sortBy?: string
  sortOrder?: SortOrder
  onSort?: (sortKey: string) => void
  footer?: ReactNode
}) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      boxShadow="sm"
      overflow="hidden"
    >
      <Table.ScrollArea maxH="calc(100vh - 320px)">
        <Table.Root size="sm" stickyHeader>
          <Table.Header>
            <Table.Row bg="gray.50">
              {columns.map((column) => {
                const active = column.sortKey !== undefined && column.sortKey === sortBy
                return (
                  <Table.ColumnHeader
                    key={column.key}
                    py={3}
                    bg="gray.50"
                    textAlign={column.align === 'end' ? 'end' : undefined}
                    fontSize="xs"
                    fontWeight="semibold"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    color="gray.600"
                    borderBottomWidth="1px"
                    borderColor="gray.200"
                    whiteSpace="nowrap"
                    aria-sort={
                      active ? (sortOrder === 'desc' ? 'descending' : 'ascending') : 'none'
                    }
                  >
                    {column.sortKey && onSort ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Sort by ${column.header}`}
                        onClick={() => onSort(column.sortKey!)}
                        {...headerLabel}
                      >
                        {column.header}
                        {active ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : ''}
                      </Button>
                    ) : (
                      column.header
                    )}
                  </Table.ColumnHeader>
                )
              })}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id} bg="white" _hover={{ bg: 'blue.50' }} transition="background 0.12s">
                {columns.map((column) => (
                  <Table.Cell
                    key={column.key}
                    py={3}
                    color="gray.700"
                    textAlign={column.align === 'end' ? 'end' : undefined}
                    whiteSpace="nowrap"
                    borderBottomWidth="1px"
                    borderColor="gray.100"
                  >
                    {column.render(row)}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      {footer ? (
        <Box px={4} py={3} bg="gray.50" borderTopWidth="1px" borderColor="gray.200">
          {footer}
        </Box>
      ) : null}
    </Box>
  )
}
