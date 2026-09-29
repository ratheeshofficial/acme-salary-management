import { Text } from '@chakra-ui/react'

import { formatMoney } from './format.ts'

export function Money({
  amount,
  currency,
  usd,
}: {
  amount: number
  currency: string
  usd?: number
}) {
  return (
    <Text as="span">
      {formatMoney(amount, currency)}
      {usd !== undefined ? (
        <Text as="span" color="fg.muted">
          {' '}
          ({formatMoney(usd, 'USD')})
        </Text>
      ) : null}
    </Text>
  )
}
