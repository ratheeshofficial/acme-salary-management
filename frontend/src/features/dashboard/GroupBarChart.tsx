import { Box } from '@chakra-ui/react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { CHART_COLORS } from '../../components/chartTheme.ts'
import { formatCompactUsd, formatCount, formatMoney } from '../../components/format.ts'
import type { SalaryGroup } from '../../types/api.ts'
import { TooltipCard } from './ChartTooltip.tsx'

// Chakra's reset beats the SVG font-size attribute recharts writes, so the size has to be inline.
const TICK_TEXT = { fontSize: '11px' } as const

type TooltipProps = {
  active?: boolean
  payload?: { payload: SalaryGroup }[]
}

function GroupTooltip({ active, payload }: TooltipProps) {
  const row = payload?.[0]?.payload
  if (!active || !row) {
    return null
  }
  return (
    <TooltipCard
      title={row.name}
      rows={[
        { name: 'Expenditure', value: formatMoney(row.totalExpenditureUsd, 'USD') },
        { name: 'Employees', value: formatCount(row.employeeCount) },
      ]}
    />
  )
}

export function GroupBarChart({
  data,
  labelWidth = 130,
  height = 320,
}: {
  data: SalaryGroup[]
  labelWidth?: number
  height?: number
}) {
  return (
    <Box h={`${height}px`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
          barCategoryGap="28%"
        >
          <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
          <XAxis
            type="number"
            tickFormatter={formatCompactUsd}
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.axis, style: TICK_TEXT }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={labelWidth}
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.label, style: TICK_TEXT }}
          />
          <Tooltip cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }} content={<GroupTooltip />} />
          <Bar
            dataKey="totalExpenditureUsd"
            name="Expenditure (USD)"
            fill={CHART_COLORS.bar}
            radius={[0, 6, 6, 0]}
            maxBarSize={26}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}
