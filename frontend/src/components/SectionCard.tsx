import { Box, Card, Heading, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Card.Root
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      boxShadow="sm"
      overflow="hidden"
    >
      <Box
        px={5}
        py={4}
        borderBottomWidth="1px"
        borderColor="gray.100"
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={3}
      >
        <Box>
          <Heading size="sm" color="gray.800">
            {title}
          </Heading>
          {description ? (
            <Text fontSize="xs" color="gray.500" mt={1}>
              {description}
            </Text>
          ) : null}
        </Box>
        {action}
      </Box>
      <Box px={3} py={4}>
        {children}
      </Box>
    </Card.Root>
  )
}
