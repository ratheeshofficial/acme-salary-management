import {
  Alert,
  Box,
  Button,
  Card,
  Field,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { ApiError } from '../../api/client.ts'
import { authRepository } from '../../repositories/auth/authRepository.ts'
import { useAuthStore } from '../../store/authStore.ts'
import { loginSchema, type LoginInput } from './loginSchema.ts'

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const login = useMutation({
    mutationFn: (values: LoginInput) => authRepository.login(values),
    onSuccess: (data) => {
      setSession(data.token, data.user)
      navigate('/', { replace: true })
    },
  })

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
      <Card.Root
        w="full"
        maxW="420px"
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="xl"
        boxShadow="sm"
      >
        <Card.Header pb={2}>
          <Flex
            align="center"
            justify="center"
            w="44px"
            h="44px"
            mb={3}
            borderRadius="xl"
            bg="blue.600"
            color="white"
          >
            <Wallet size={22} />
          </Flex>
          <Heading size="lg" color="gray.900">
            HR Manager login
          </Heading>
          <Card.Description color="gray.500">
            Sign in to manage ACME employee salaries.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <form noValidate onSubmit={handleSubmit((values) => login.mutate(values))}>
            <Stack gap={4}>
              {login.error ? (
                <Alert.Root status="error">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>
                      {login.error instanceof ApiError ? login.error.message : 'Login failed'}
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              ) : null}
              <Field.Root invalid={Boolean(errors.email)}>
                <Field.Label htmlFor="email" fontSize="sm" color="gray.700">
                  Email
                </Field.Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@acme.com"
                  {...register('email')}
                />
                <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
              </Field.Root>
              <Field.Root invalid={Boolean(errors.password)}>
                <Field.Label htmlFor="password" fontSize="sm" color="gray.700">
                  Password
                </Field.Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>
              <Button type="submit" colorPalette="blue" mt={1} loading={login.isPending}>
                Log in
              </Button>
              <Box borderTopWidth="1px" borderColor="gray.100" pt={3}>
                <Text fontSize="xs" color="gray.500">
                  Seeded account: hr@acme.com / Password123
                </Text>
              </Box>
            </Stack>
          </form>
        </Card.Body>
      </Card.Root>
    </Flex>
  )
}
