import { Box, Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Users, Wallet } from 'lucide-react'

import { formatCount, formatMoney, formatShare } from '../../components/format.ts'
import { QueryState } from '../../components/QueryState.tsx'
import { SectionCard } from '../../components/SectionCard.tsx'
import { StatCard } from '../../components/StatCard.tsx'
import { queryKeys } from '../../services/queryKeys.ts'
import type { Dashboard, SalaryBand } from '../../types/api.ts'
import { dashboardRepository } from '../../repositories/dashboard/dashboardRepository.ts'
import { GroupBarChart } from './GroupBarChart.tsx'

export function DashboardPage() {
  const dashboard = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => dashboardRepository.get(),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <Stack gap={6}>
      <Box>
        <Heading size="lg" color="gray.900">
          Salary insights
        </Heading>
        <Text color="gray.500" mt={1} maxW="3xl">
          Salaries are stored in each employee&apos;s local currency. Organization figures on this
          page are converted to USD.
        </Text>
      </Box>
      <QueryState isLoading={dashboard.isPending} error={dashboard.error}>
        {dashboard.data ? <DashboardContent data={dashboard.data} /> : null}
      </QueryState>
    </Stack>
  )
}

function DashboardContent({ data }: { data: Dashboard }) {
  const bandTotal = data.distribution.reduce((sum, band) => sum + band.count, 0)

  return (
    <Stack gap={5}>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <StatCard label="Total employees" value={formatCount(data.totalEmployees)} icon={Users} />
        <StatCard
          label="Average salary"
          value={formatMoney(data.averageSalaryUsd, 'USD')}
          hint="Per employee, in USD"
          icon={Wallet}
        />
        <StatCard
          label="Total expenditure"
          value={formatMoney(data.totalExpenditureUsd, 'USD')}
          hint="Current salaries, in USD"
          icon={Building2}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} gap={5} alignItems="stretch">
        <SectionCard
          title="Country expenditure"
          description="Total current salary expenditure in USD"
        >
          {data.byCountry.length === 0 ? (
            <EmptyChart />
          ) : (
            <GroupBarChart data={data.byCountry} labelWidth={105} />
          )}
        </SectionCard>
        <SectionCard
          title="Department expenditure"
          description="Total current salary expenditure in USD"
        >
          {data.byDepartment.length === 0 ? (
            <EmptyChart />
          ) : (
            <GroupBarChart data={data.byDepartment} labelWidth={120} />
          )}
        </SectionCard>
      </SimpleGrid>

      <SectionCard title="Salary distribution" description="Current salaries grouped into USD bands">
        <Stack gap={4} px={2} py={1}>
          {data.distribution.map((band) => (
            <BandRow key={band.band} band={band} total={bandTotal} />
          ))}
        </Stack>
      </SectionCard>
    </Stack>
  )
}

function BandRow({ band, total }: { band: SalaryBand; total: number }) {
  const percent = total > 0 ? (band.count / total) * 100 : 0

  return (
    <Box>
      <Flex justify="space-between" align="baseline" gap={3} mb={2}>
        <Text fontSize="sm" color="gray.700">
          {band.label}
        </Text>
        <Flex gap={2} align="baseline">
          <Text fontSize="sm" fontWeight="semibold" color="gray.900">
            {formatCount(band.count)}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {formatShare(band.count, total)}
          </Text>
        </Flex>
      </Flex>
      <Box h="8px" bg="gray.100" borderRadius="full" overflow="hidden">
        <Box h="full" w={`${percent}%`} bg="blue.600" borderRadius="full" />
      </Box>
    </Box>
  )
}

function EmptyChart() {
  return (
    <Flex h="320px" align="center" justify="center">
      <Text color="gray.500" fontSize="sm">
        No salary data.
      </Text>
    </Flex>
  )
}
