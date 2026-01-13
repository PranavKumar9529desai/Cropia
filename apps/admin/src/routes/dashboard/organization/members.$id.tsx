import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/organization/members/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/organization/members/$id"!</div>
}
