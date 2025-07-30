import { getPostsByUsername } from "@/api/post.api";
import { getUserByUsername } from "@/api/user.api";
import PostCard from "@/components/PostCard/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";

export const Route = createFileRoute("/_auth/$username/")({
    component: UserProfilePage,
    beforeLoad: async ({ params, context }) => {
        await context.queryClient.prefetchQuery(
            getUserByUsername(params.username)
        );
    },
});

function UserProfilePage() {
    const { username } = Route.useParams();

    const { data: user, isLoading: isUserLoading } = useQuery(
        getUserByUsername(username)
    );

    return (
        <div className="space-y-4">
            <section
                className={`flex items-center gap-4 rounded-lg border bg-gradient-to-bl from-indigo-200 to-lime-200 p-4 shadow-md`}
                style={{
                    backgroundImage: user?.coverPicture
                        ? `url(${user.coverPicture})`
                        : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div>
                    <Avatar className="h-20 w-20">
                        <AvatarImage
                            src={user?.profilePicture as string}
                            alt={user?.username}
                        />
                        <AvatarFallback>
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <h1>{user?.username}</h1>
                    <h5>
                        Joined:{" "}
                        {format(
                            new Date(user?.createdAt as string),
                            "MMMM dd, yyyy"
                        )}
                    </h5>
                </div>
            </section>

            <section>
                <Tabs defaultValue="posts" className="">
                    <TabsList>
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="comments">Comments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts">
                        <PostsSection username={username} />
                    </TabsContent>
                    <TabsContent value="comments">Cumming soon!</TabsContent>
                </Tabs>
            </section>
        </div>
    );
}

type PostsSectionProps = {
    username: string;
};
function PostsSection({ username }: PostsSectionProps) {
    const { data: userData, isLoading: isUserLoading } = useQuery(
        getUserByUsername(username)
    );

    const user = userData!;

    const { data, fetchNextPage } = useSuspenseInfiniteQuery(
        getPostsByUsername(username, {
            limit: 10,
            offset: 0,
        })
    );

    const posts = data.pages.flatMap(page => page.data);

    return posts.map(post => {
        return (
            <PostCard
                className=""
                key={post.id}
                post={{
                    ...post,
                    author: {
                        avatar: user.profilePicture,
                        username: user.username,
                        id: user.id,
                        email: user.email,
                    },
                    authorId: user.id,
                }}
            />
        );
    });
}
