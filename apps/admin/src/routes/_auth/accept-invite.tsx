import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/accept-invite')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/_auth/accept-invite"!</div>
}
