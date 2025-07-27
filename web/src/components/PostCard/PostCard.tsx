import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { InferResponseType } from "hono/client";
import api from "@/lib/api";
import { format } from "date-fns";
import ReactBtn from "@/components/ReactBtn";

type Post = InferResponseType<typeof api.posts.$get>["data"][number];

type PostCardProps = {
    post: Post;
};

function PostCard({ post }: PostCardProps) {
    return (
        <Card>
            <CardHeader className="flex items-center gap-4 border-b shadow-lg">
                <Avatar>
                    <AvatarImage src={post.author?.avatar as string} />
                    <AvatarFallback>
                        {post.author?.username?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <CardTitle>
                    {/* <h3>{post.author_name}</h3> */}
                    <h5>@{post.author?.username}</h5>
                    <p className="text-muted-foreground text-xs">
                        Posted on{" "}
                        {format(new Date(post.createdAt), "dd MMM yyyy HH:mm")}
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
                        username: post.author.username as string,
                        postId: post.id.toString(),
                    }}
                    className="flex-1"
                >
                    <Button className="w-full">Comment</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

export default PostCard;
