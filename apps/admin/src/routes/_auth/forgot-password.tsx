import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ForgotPasswordCard } from '@repo/ui/components/auth/forgot-password-card'
import { authClient } from '@/lib/auth/auth-client'

export const Route = createFileRoute('/_auth/forgot-password')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleForgotSubmit = async ({ email }: { email: string }) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {

      await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })
      setSuccess("If an account exists with that email, we've sent a reset link.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ForgotPasswordCard
        onSubmit={handleForgotSubmit}
        isLoading={isLoading}
        error={error}
        successMessage={success}
        onBackToLogin={() => navigate({ to: '/sign-in' })}
      />
    </div>
  )
}
