import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/scan/success')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/scan/success"!</div>
}
