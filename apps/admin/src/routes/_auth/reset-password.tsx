import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ResetPasswordCard } from '@repo/ui/components/auth/reset-password-card'
import { authClient } from '../../lib/auth/auth-client'

// Define search params validation to get the token from URL safely
export interface ResetSearch {
  token: string
}

export const Route = createFileRoute('/_auth/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetSearch => {
    return {
      token: (search.token as string) || '',
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResetSubmit = async (password: string) => {
    if (!token) {
      setError("Invalid or missing reset token.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Replace with actual authClient call
      await authClient.resetPassword({
        token,
        newPassword: password
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Navigate to login with success message or toast
      navigate({ to: '/sign-in' })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ResetPasswordCard
        onSubmit={handleResetSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
