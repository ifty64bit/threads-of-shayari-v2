import { getPosts } from "@/api/post.api";
import CreatePost from "@/components/CreatePost";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/feed")({
    component: FeedRoute,
});

function FeedRoute() {
    const { data } = useInfiniteQuery(getPosts());

    const posts = data?.pages.flatMap((page) => page.data) || [];

    return (
        <div>
            <section>
                <CreatePost />
            </section>
            <section>
                <h2>Posts</h2>

                {posts.map((post) => (
                    <Card key={post.id}>
                        <CardHeader>
                            <CardTitle>
                                {/* <h3>{post.author}</h3> */}
                            </CardTitle>
                        </CardHeader>
                        <p>{post.content}</p>
                    </Card>
                ))}
            </section>
        </div>
    );
}
