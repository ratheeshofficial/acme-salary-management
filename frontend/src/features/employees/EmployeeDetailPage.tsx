import { Badge, Box, Button, Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link as RouterLink, useParams } from 'react-router-dom'

import { Money } from '../../components/Money.tsx'
import { QueryState } from '../../components/QueryState.tsx'
import { SectionCard } from '../../components/SectionCard.tsx'
import { queryKeys } from '../../services/queryKeys.ts'
import { listSalaries } from '../salaries/api.ts'
import { SalaryForm } from '../salaries/SalaryForm.tsx'
import { SalaryHistory } from '../salaries/SalaryHistory.tsx'
import { getEmployee } from './api.ts'

export function EmployeeDetailPage() {
  const { id = '' } = useParams()
  const employeeQuery = useQuery({
    queryKey: queryKeys.employee(id),
    queryFn: () => getEmployee(id),
    enabled: Boolean(id),
  })
  const salariesQuery = useQuery({
    queryKey: queryKeys.salaries(id),
    queryFn: () => listSalaries(id),
    enabled: Boolean(id),
  })

  const employee = employeeQuery.data
  const salaries = salariesQuery.data ?? []

  return (
    <Stack gap={5}>
      <Button
        asChild
        variant="ghost"
        size="sm"
        alignSelf="flex-start"
        px={2}
        ml={-2}
        color="gray.600"
      >
        <RouterLink to="/employees">
          <ArrowLeft size={16} />
          Back to employees
        </RouterLink>
      </Button>
      <QueryState isLoading={employeeQuery.isPending} error={employeeQuery.error}>
        {employee ? (
          <Stack gap={5}>
            <Flex justify="space-between" align="flex-start" gap={4} wrap="wrap">
              <Box>
                <Heading size="lg" color="gray.900">
                  {employee.firstName} {employee.lastName}
                </Heading>
                <Flex align="center" gap={2} mt={2}>
                  <Badge variant="subtle" colorPalette="blue" fontFamily="mono">
                    {employee.employeeCode}
                  </Badge>
                  <Text fontSize="sm" color="gray.600">
                    {employee.designation} · {employee.department}
                  </Text>
                </Flex>
              </Box>
              {employee.currentSalary ? (
                <Box textAlign={{ base: 'left', sm: 'right' }}>
                  <Text
                    fontSize="10px"
                    fontWeight="semibold"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    color="gray.500"
                  >
                    Current salary
                  </Text>
                  <Text fontSize="2xl" fontWeight="semibold" color="gray.900" lineHeight="short">
                    <Money
                      amount={employee.currentSalary.amount}
                      currency={employee.currentSalary.currency}
                      usd={employee.currentSalary.amountUsd}
                    />
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Effective {employee.currentSalary.effectiveFrom}
                  </Text>
                </Box>
              ) : null}
            </Flex>

            <SectionCard title="Profile">
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} px={2}>
                <Detail label="Email" value={employee.email} />
                <Detail label="Country" value={employee.country} />
                <Detail label="Department" value={employee.department} />
                <Detail label="Designation" value={employee.designation} />
              </SimpleGrid>
            </SectionCard>

            <SalaryHistory
              salaries={salaries}
              isLoading={salariesQuery.isPending}
              error={salariesQuery.error}
            />

            <SectionCard
              title="Record salary"
              description="Amount is stored in the selected currency; the API returns the USD equivalent."
            >
              <Box px={2}>
                <SalaryForm
                  employeeId={employee.id}
                  existingDates={salaries.map((salary) => salary.effectiveFrom)}
                />
              </Box>
            </SectionCard>
          </Stack>
        ) : null}
      </QueryState>
    </Stack>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box minW={0}>
      <Text fontSize="xs" color="gray.500">
        {label}
      </Text>
      <Text color="gray.800" truncate title={value}>
        {value}
      </Text>
    </Box>
  )
}
