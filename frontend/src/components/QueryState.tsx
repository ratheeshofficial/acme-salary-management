import { Alert, Spinner, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export function QueryState({
  isLoading,
  error,
  isEmpty = false,
  emptyMessage = 'Nothing to show.',
  children,
}: {
  isLoading: boolean
  error: Error | null
  isEmpty?: boolean
  emptyMessage?: string
  children: ReactNode
}) {
  if (isLoading) {
    return (
      <Stack direction="row" align="center" gap={3} py={6}>
        <Spinner />
        <Text>Loading</Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Request failed</Alert.Title>
          <Alert.Description>{error.message}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  if (isEmpty) {
    return <Text color="fg.muted">{emptyMessage}</Text>
  }

  return children
}
