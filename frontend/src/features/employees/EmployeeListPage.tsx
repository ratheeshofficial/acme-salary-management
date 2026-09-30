import {
  Badge,
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  InputGroup,
  Link,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'

import { DataTable, type DataColumn } from '../../components/DataTable.tsx'
import { formatCount } from '../../components/format.ts'
import { Money } from '../../components/Money.tsx'
import { PaginationBar } from '../../components/PaginationBar.tsx'
import { QueryState } from '../../components/QueryState.tsx'
import { queryKeys } from '../../services/queryKeys.ts'
import type { Employee } from '../../types/api.ts'
import { employeeRepository } from '../../repositories/employee/employeeRepository.ts'
import { parseEmployeeQuery, type EmployeeQuery, type SortField } from './employeeQuery.ts'

export function EmployeeListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(() => parseEmployeeQuery(searchParams), [searchParams])
  const [searchInput, setSearchInput] = useState(query.search)
  const [syncedSearch, setSyncedSearch] = useState(query.search)
  if (query.search !== syncedSearch) {
    setSyncedSearch(query.search)
    setSearchInput(query.search)
  }

  const applyQuery = useCallback(
    (nextQuery: EmployeeQuery, replace = false) => {
      const next = new URLSearchParams()
      if (nextQuery.search) next.set('search', nextQuery.search)
      if (nextQuery.country) next.set('country', nextQuery.country)
      if (nextQuery.department) next.set('department', nextQuery.department)
      if (nextQuery.sortBy !== 'employee_code') next.set('sortBy', nextQuery.sortBy)
      if (nextQuery.sortOrder !== 'asc') next.set('sortOrder', nextQuery.sortOrder)
      if (nextQuery.page !== 1) next.set('page', String(nextQuery.page))
      if (nextQuery.limit !== 20) next.set('limit', String(nextQuery.limit))
      setSearchParams(next, { replace })
    },
    [setSearchParams],
  )

  useEffect(() => {
    if (searchInput === query.search) {
      return
    }
    const handle = window.setTimeout(() => {
      applyQuery({ ...query, search: searchInput, page: 1 }, true)
    }, 300)
    return () => window.clearTimeout(handle)
  }, [applyQuery, query, searchInput])

  const employees = useQuery({
    queryKey: queryKeys.employees(query),
    queryFn: () => employeeRepository.list(query),
    placeholderData: keepPreviousData,
  })
  const filters = useQuery({
    queryKey: queryKeys.filters,
    queryFn: () => employeeRepository.getFilters(),
    staleTime: 5 * 60 * 1000,
  })

  function onSort(sortKey: string) {
    const sortBy = sortKey as SortField
    const sortOrder = query.sortBy === sortBy && query.sortOrder === 'asc' ? 'desc' : 'asc'
    applyQuery({ ...query, sortBy, sortOrder, page: 1 })
  }

  const hasFilters = Boolean(query.search || query.country || query.department)

  return (
    <Stack gap={5}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={3}>
        <Box>
          <Flex align="center" gap={3}>
            <Heading size="lg" color="gray.900">
              Employees
            </Heading>
            {employees.data ? (
              <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={2.5}>
                {formatCount(employees.data.total)}
              </Badge>
            ) : null}
          </Flex>
          <Text color="gray.500" mt={1}>
            Search and filter on the server. Only the current page is loaded.
          </Text>
        </Box>
        {employees.isFetching && !employees.isPending ? (
          <Text fontSize="sm" color="gray.500">
            Updating…
          </Text>
        ) : null}
      </Flex>

      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="xl"
        boxShadow="sm"
        px={4}
        py={4}
      >
        <Flex gap={3} align="flex-end" wrap="wrap">
          <Field.Root flex="1 1 280px" minW="220px">
            <Field.Label htmlFor="employee-search" fontSize="xs" color="gray.600">
              Search
            </Field.Label>
            <InputGroup startElement={<Search size={16} color="#9ca3af" />}>
              <Input
                id="employee-search"
                type="search"
                value={searchInput}
                placeholder="Name, email, or employee code"
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </InputGroup>
          </Field.Root>
          <Field.Root flex="0 0 auto" w={{ base: 'full', sm: '200px' }}>
            <Field.Label htmlFor="employee-country" fontSize="xs" color="gray.600">
              Country
            </Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                id="employee-country"
                value={query.country}
                onChange={(event) => applyQuery({ ...query, country: event.target.value, page: 1 })}
              >
                <option value="">All countries</option>
                {(filters.data?.countries ?? []).map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root flex="0 0 auto" w={{ base: 'full', sm: '210px' }}>
            <Field.Label htmlFor="employee-department" fontSize="xs" color="gray.600">
              Department
            </Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                id="employee-department"
                value={query.department}
                onChange={(event) =>
                  applyQuery({ ...query, department: event.target.value, page: 1 })
                }
              >
                <option value="">All departments</option>
                {(filters.data?.departments ?? []).map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          {hasFilters ? (
            <Button
              variant="ghost"
              colorPalette="gray"
              color="gray.600"
              onClick={() =>
                applyQuery({ ...query, search: '', country: '', department: '', page: 1 })
              }
            >
              <X size={16} />
              Clear
            </Button>
          ) : null}
        </Flex>
      </Box>

      <QueryState
        isLoading={employees.isPending}
        error={employees.error}
        isEmpty={(employees.data?.items.length ?? 0) === 0}
        emptyMessage="No employees match these filters."
      >
        {employees.data ? (
          <DataTable
            rows={employees.data.items}
            sortBy={query.sortBy}
            sortOrder={query.sortOrder}
            onSort={onSort}
            columns={employeeColumns}
            footer={
              <PaginationBar
                page={employees.data.page}
                limit={employees.data.limit}
                total={employees.data.total}
                onPageChange={(page) => applyQuery({ ...query, page })}
                onLimitChange={(limit) => applyQuery({ ...query, limit, page: 1 })}
              />
            }
          />
        ) : null}
      </QueryState>
    </Stack>
  )
}

const employeeColumns: DataColumn<Employee>[] = [
  {
    key: 'code',
    header: 'Code',
    sortKey: 'employee_code',
    render: (employee) => (
      <Text as="span" fontFamily="mono" fontSize="xs" color="gray.600">
        {employee.employeeCode}
      </Text>
    ),
  },
  {
    key: 'name',
    header: 'Name',
    sortKey: 'last_name',
    render: (employee) => (
      <Link asChild color="blue.700" fontWeight="medium">
        <RouterLink to={`/employees/${employee.id}`}>
          {employee.firstName} {employee.lastName}
        </RouterLink>
      </Link>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    sortKey: 'email',
    render: (employee) => employee.email,
  },
  {
    key: 'country',
    header: 'Country',
    sortKey: 'country',
    render: (employee) => employee.country,
  },
  {
    key: 'department',
    header: 'Department',
    sortKey: 'department',
    render: (employee) => (
      <Badge colorPalette="gray" variant="subtle" borderRadius="full" px={2}>
        {employee.department}
      </Badge>
    ),
  },
  {
    key: 'designation',
    header: 'Designation',
    sortKey: 'designation',
    render: (employee) => employee.designation,
  },
  {
    key: 'salary',
    header: 'Current salary',
    align: 'end',
    render: (employee) =>
      employee.currentSalary ? (
        <Text as="span" fontWeight="medium" color="gray.900">
          <Money
            amount={employee.currentSalary.amount}
            currency={employee.currentSalary.currency}
          />
        </Text>
      ) : (
        <Text as="span" color="gray.400">
          —
        </Text>
      ),
  },
]
