import { Alert, Button, Field, Input, NativeSelect, SimpleGrid, Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ApiError } from '../../services/api.ts'
import { queryKeys } from '../../services/queryKeys.ts'
import { createSalary } from './api.ts'
import { CURRENCIES, createSalarySchema } from './salarySchema.ts'

type FormValues = {
  amount: string | number
  currency: string
  effectiveFrom: string
}

export function SalaryForm({
  employeeId,
  existingDates,
}: {
  employeeId: string
  existingDates: string[]
}) {
  const queryClient = useQueryClient()
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const schema = useMemo(() => createSalarySchema(existingDates), [existingDates])
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', currency: 'USD', effectiveFrom: '' },
  })

  const mutation = useMutation({
    mutationFn: (payload: FormValues) =>
      createSalary(employeeId, {
        amount: Number(payload.amount),
        currency: payload.currency,
        effectiveFrom: payload.effectiveFrom,
      }),
    onSuccess: async () => {
      setServerMessage(null)
      reset({ amount: '', currency: 'USD', effectiveFrom: '' })
      await queryClient.invalidateQueries({ queryKey: queryKeys.salaries(employeeId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.employee(employeeId) })
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        setError('effectiveFrom', { message: error.message })
        setServerMessage(null)
        return
      }
      setServerMessage(error instanceof Error ? error.message : 'Could not record salary')
    },
  })

  const labelProps = { fontSize: 'xs', color: 'gray.600' } as const

  return (
    <form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Stack gap={4}>
        <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
          <Field.Root invalid={Boolean(errors.amount)}>
            <Field.Label htmlFor="salary-amount" {...labelProps}>
              Amount
            </Field.Label>
            <Input
              id="salary-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('amount')}
            />
            <Field.ErrorText>{errors.amount?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={Boolean(errors.currency)}>
            <Field.Label htmlFor="salary-currency" {...labelProps}>
              Currency
            </Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field id="salary-currency" {...register('currency')}>
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Field.ErrorText>{errors.currency?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={Boolean(errors.effectiveFrom)}>
            <Field.Label htmlFor="salary-effective-from" {...labelProps}>
              Effective date
            </Field.Label>
            <Input id="salary-effective-from" type="date" {...register('effectiveFrom')} />
            <Field.ErrorText>{errors.effectiveFrom?.message}</Field.ErrorText>
          </Field.Root>
        </SimpleGrid>
        {serverMessage ? (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{serverMessage}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        ) : null}
        <Button
          type="submit"
          colorPalette="blue"
          alignSelf="flex-start"
          loading={mutation.isPending}
        >
          <Plus size={16} />
          Record salary
        </Button>
      </Stack>
    </form>
  )
}
