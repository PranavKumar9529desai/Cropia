import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/settings/account')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/settings/account"!</div>
}
