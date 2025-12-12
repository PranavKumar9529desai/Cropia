import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { VerifyEmailCard } from '@repo/ui/components/auth/verify-email-card'
import { authClient } from '@/lib/auth/auth-client'

interface VerifySearch {
  token: string
}

export const Route = createFileRoute('/_auth/verify-email')({
  validateSearch: (search: Record<string, unknown>): VerifySearch => {
    return {
      token: (search.token as string) || '',
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch()
  const navigate = useNavigate()

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // 1. Guard clause: No token? Error out immediately.
    if (!token) {
      setStatus('error')
      setMessage('Missing verification token.')
      return
    }

    // 2. Define the verify function
    const verify = async () => {
      try {
        await authClient.verifyEmail({
          query: {
            token: token // Pass the token to better-auth
          }
        })
        setStatus('success')
      } catch (err) {
        setStatus('error')
        if (err instanceof Error) {
          setMessage(err.message)
        } else {
          setMessage("The link is invalid or has expired.")
        }
      }
    }

    // 3. Run it
    verify()
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <VerifyEmailCard
        status={status}
        message={message}
        onGoToLogin={() => navigate({ to: '/sign-in' })}
        onVerify={() => window.location.reload()}
        onContinue={() => navigate({ to: '/$authType/location', params: { authType: 'farmer' } })}
      />
    </div>
  )
}
