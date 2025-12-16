import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/crop-map')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/crop-map"!</div>
}
