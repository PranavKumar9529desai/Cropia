import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/organization/members')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/organization/members"!</div>
}
