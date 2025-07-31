import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/profile")({
    component: ProfilePage,
    beforeLoad: async ({ context }) => {},
});

function ProfilePage() {
    return <div>Hello "/_auth/profile"!</div>;
}
