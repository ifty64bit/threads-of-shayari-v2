import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/feed')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/feed"!</div>
}
