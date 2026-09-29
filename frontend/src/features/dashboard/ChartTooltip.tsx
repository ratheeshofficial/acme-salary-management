import { Box, Text } from '@chakra-ui/react'

type TooltipRow = {
  name: string
  value: string
}

export function TooltipCard({ title, rows }: { title: string; rows: TooltipRow[] }) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      boxShadow="md"
      px={3}
      py={2}
      minW="180px"
    >
      <Text fontSize="sm" fontWeight="semibold" color="gray.800">
        {title}
      </Text>
      {rows.map((row) => (
        <Box key={row.name} display="flex" justifyContent="space-between" gap={4} mt={1}>
          <Text fontSize="xs" color="gray.500">
            {row.name}
          </Text>
          <Text fontSize="xs" fontWeight="medium" color="gray.800">
            {row.value}
          </Text>
        </Box>
      ))}
    </Box>
  )
}
