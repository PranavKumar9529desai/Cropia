import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/scan/failure')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello &quot;/dashboard/scan/failure&quot;!</div>
}
