import { Badge, Box, Heading, Stack, Text } from '@chakra-ui/react'

import { DataTable, type DataColumn } from '../../components/DataTable.tsx'
import { Money } from '../../components/Money.tsx'
import { QueryState } from '../../components/QueryState.tsx'
import type { Salary } from '../../types/api.ts'

const columns: DataColumn<Salary>[] = [
  {
    key: 'effectiveFrom',
    header: 'Effective date',
    render: (salary) => salary.effectiveFrom,
  },
  {
    key: 'currency',
    header: 'Currency',
    render: (salary) => (
      <Badge variant="subtle" colorPalette="gray">
        {salary.currency}
      </Badge>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'end',
    render: (salary) => (
      <Box fontWeight="medium" color="gray.900">
        <Money amount={salary.amount} currency={salary.currency} usd={salary.amountUsd} />
      </Box>
    ),
  },
]

export function SalaryHistory({
  salaries,
  isLoading,
  error,
}: {
  salaries: Salary[]
  isLoading: boolean
  error: Error | null
}) {
  return (
    <Stack gap={3}>
      <Box>
        <Heading size="sm" color="gray.800">
          Salary history
        </Heading>
        <Text color="gray.500" fontSize="xs" mt={1}>
          Newest effective date first. Recording a salary keeps the previous rows.
        </Text>
      </Box>
      <QueryState
        isLoading={isLoading}
        error={error}
        isEmpty={salaries.length === 0}
        emptyMessage="No salary history yet."
      >
        <DataTable rows={salaries} columns={columns} />
      </QueryState>
    </Stack>
  )
}
