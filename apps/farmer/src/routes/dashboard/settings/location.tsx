import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/settings/location')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/settings/location"!</div>
}
