import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LayoutDashboard, LogOut, Users, Wallet, type LucideIcon } from 'lucide-react'
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { api } from '../services/api.ts'
import { useAuthStore } from '../store/authStore.ts'

const NAV: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
]

function initials(email?: string) {
  return (email ?? '?').slice(0, 2).toUpperCase()
}

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)

  const logout = useMutation({
    mutationFn: () => api<void>('/api/auth/logout', { method: 'POST' }),
    onSettled: () => {
      clearSession()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })

  return (
    <Flex direction={{ base: 'column', md: 'row' }} minH="100vh" bg="gray.50">
      <Flex
        as="nav"
        direction="column"
        w={{ base: 'full', md: '240px' }}
        h={{ md: '100vh' }}
        alignSelf={{ md: 'flex-start' }}
        position={{ md: 'sticky' }}
        top={0}
        flexShrink={0}
        bg="white"
        borderRightWidth={{ md: '1px' }}
        borderBottomWidth={{ base: '1px', md: 0 }}
        borderColor="gray.200"
        px={4}
        py={5}
      >
        <Flex align="center" gap={2.5}>
          <Flex
            align="center"
            justify="center"
            w="34px"
            h="34px"
            flexShrink={0}
            borderRadius="lg"
            bg="blue.600"
            color="white"
          >
            <Wallet size={18} />
          </Flex>
          <Box>
            <Heading size="sm" color="gray.900" lineHeight="short">
              ACME Salary
            </Heading>
            <Text fontSize="xs" color="gray.500">
              HR workspace
            </Text>
          </Box>
        </Flex>
        <Text
          mt={8}
          fontSize="10px"
          fontWeight="semibold"
          letterSpacing="widest"
          textTransform="uppercase"
          color="gray.400"
        >
          Menu
        </Text>
        <Stack mt={2} gap={1}>
          {NAV.map((item) => {
            const active =
              item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
            const Icon = item.icon
            return (
              <Button
                key={item.to}
                asChild
                justifyContent="flex-start"
                variant="ghost"
                colorPalette="blue"
                fontWeight={active ? 'semibold' : 'medium'}
                bg={active ? 'blue.50' : undefined}
                color={active ? 'blue.700' : 'gray.600'}
                _hover={active ? { bg: 'blue.50' } : { bg: 'gray.100', color: 'gray.900' }}
              >
                <RouterLink to={item.to}>
                  <Icon size={18} />
                  {item.label}
                </RouterLink>
              </Button>
            )
          })}
        </Stack>
        <Box mt={{ base: 6, md: 'auto' }} pt={4} borderTopWidth="1px" borderColor="gray.200">
          <Flex align="center" gap={2.5} px={1} mb={2}>
            <Flex
              align="center"
              justify="center"
              w="30px"
              h="30px"
              flexShrink={0}
              borderRadius="full"
              bg="blue.50"
              color="blue.700"
              fontSize="xs"
              fontWeight="semibold"
            >
              {initials(user?.email)}
            </Flex>
            <Text fontSize="xs" color="gray.500" truncate>
              {user?.email}
            </Text>
          </Flex>
          <Button
            w="full"
            justifyContent="flex-start"
            variant="ghost"
            colorPalette="blue"
            color="blue.600"
            _hover={{ bg: 'blue.600', color: 'white' }}
            loading={logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOut size={18} />
            Log out
          </Button>
        </Box>
      </Flex>
      <Box flex="1" p={{ base: 4, md: 8 }}>
        <Outlet />
      </Box>
    </Flex>
  )
}
