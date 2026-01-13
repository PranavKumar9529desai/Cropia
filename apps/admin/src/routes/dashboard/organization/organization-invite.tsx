import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/organization/organization-invite',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/organization/organization-invite"!</div>
}
