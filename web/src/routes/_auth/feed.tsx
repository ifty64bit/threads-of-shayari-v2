import { getPosts } from "@/api/post.api";
import CreatePost from "@/components/CreatePost";
import ReactBtn from "@/components/ReactBtn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";

export const Route = createFileRoute("/_auth/feed")({
    component: FeedRoute,
});

function FeedRoute() {
    const { data } = useInfiniteQuery(getPosts());

    const posts = data?.pages.flatMap(page => page.data) || [];

    return (
        <div>
            <section>
                <CreatePost />
            </section>
            <section>
                <h2 className="text-lg font-semibold">Posts</h2>
                <hr className="my-2" />

                <div className="space-y-4">
                    {posts.length === 0 && (
                        <p>No posts available. Be the first to create one!</p>
                    )}
                    {posts.map(post => (
                        <Card key={post.id}>
                            <CardHeader className="flex items-center gap-4 border-b shadow-lg">
                                <Avatar>
                                    <AvatarImage
                                        src={post.author?.avatar as string}
                                    />
                                    <AvatarFallback>
                                        {post.author?.username?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle>
                                    {/* <h3>{post.author_name}</h3> */}
                                    <h5>@{post.author?.username}</h5>
                                    <p className="text-muted-foreground text-xs">
                                        Posted on{" "}
                                        {format(
                                            new Date(post.createdAt),
                                            "dd MMM yyyy HH:mm"
                                        )}
                                    </p>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="whitespace-pre-wrap">
                                {post.content}
                            </CardContent>
                            <CardFooter className="flex justify-between gap-4 border-t">
                                <ReactBtn post={post} />
                                <Link
                                    to="/$username/$postId"
                                    params={{
                                        username: post.author
                                            .username as string,
                                        postId: post.id.toString(),
                                    }}
                                    className="flex-1"
                                >
                                    <Button className="w-full">Comment</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
