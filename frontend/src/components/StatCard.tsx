import { Box, Card, Flex, Heading, Text } from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string
  icon?: LucideIcon
}) {
  return (
    <Card.Root bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" boxShadow="sm">
      <Card.Body px={5} py={4}>
        <Flex align="flex-start" justify="space-between" gap={3}>
          <Box>
            <Text color="gray.500" fontSize="xs" fontWeight="medium" letterSpacing="wide" textTransform="uppercase">
              {label}
            </Text>
            <Heading size="xl" mt={2} color="gray.900">
              {value}
            </Heading>
            {hint ? (
              <Text color="gray.500" fontSize="xs" mt={1}>
                {hint}
              </Text>
            ) : null}
          </Box>
          {Icon ? (
            <Flex
              align="center"
              justify="center"
              w="40px"
              h="40px"
              flexShrink={0}
              borderRadius="lg"
              bg="blue.50"
              color="blue.600"
            >
              <Icon size={20} />
            </Flex>
          ) : null}
        </Flex>
      </Card.Body>
    </Card.Root>
  )
}
