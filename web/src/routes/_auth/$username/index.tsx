import { getUserByUsername } from "@/api/user.api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/$username/")({
    component: UserProfilePage,
});

function UserProfilePage() {
    const { username } = Route.useParams();

    const { data: user, isLoading: isUserLoading } = useQuery(
        getUserByUsername(username)
    );

    return <div>Hello "/_auth/$username"!</div>;
}
