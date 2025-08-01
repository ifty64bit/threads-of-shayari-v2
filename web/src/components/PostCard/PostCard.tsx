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
import { getEmojiForReaction } from "shared";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { authAtom } from "@/lib/store";
import { useAtom } from "jotai/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Trash } from "lucide-react";
import { useDeletePost } from "@/api/post.api";

type Post = InferResponseType<typeof api.posts.$get>["data"][number] & {
    comment_count?: number;
};

type PostCardProps = {
    post: Post;
    className?: string;
};

function PostCard({ post, className }: PostCardProps) {
    const [auth] = useAtom(authAtom);

    const deletePost = useDeletePost();

    const groupedReactions = Object.values(
        post.reactions.reduce(
            (acc, reaction) => {
                if (!acc[reaction.type]) {
                    acc[reaction.type] = {
                        type: reaction.type,
                        reactions: [],
                    };
                }
                acc[reaction.type].reactions.push(reaction);
                return acc;
            },
            {} as Record<
                string,
                { type: string; reactions: typeof post.reactions }
            >
        )
    );

    return (
        <Card className={cn("gap-4", className)}>
            <CardHeader className="flex items-center justify-between gap-4 border-b shadow-lg">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={post.author?.avatar as string} />
                        <AvatarFallback>
                            {post.author?.username?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <CardTitle>
                        {/* <h3>{post.author_name}</h3> */}
                        <Link
                            to="/$username"
                            params={{
                                username: post.author?.username as string,
                            }}
                            className="hover:underline"
                        >
                            <h5>@{post.author?.username}</h5>
                        </Link>
                        <p className="text-muted-foreground text-xs">
                            Posted on{" "}
                            {format(
                                new Date(post.created_at),
                                "dd MMM yyyy HH:mm"
                            )}
                        </p>
                    </CardTitle>
                </div>
                {auth?.user?.username === post.author?.username && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 px-2"
                                size={"icon"}
                            >
                                <Ellipsis />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                    deletePost.mutate(post.id.toString());
                                }}
                            >
                                <Trash color="red" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>
            <CardContent className="whitespace-pre-wrap">
                {post.content}
                <div className="mt-2">
                    {groupedReactions.map(reaction => (
                        <span
                            key={reaction.type}
                            className="mr-2 rounded-full border p-1"
                        >
                            <Tooltip>
                                <TooltipTrigger>
                                    {reaction.reactions.length}{" "}
                                    {getEmojiForReaction(reaction.type)}
                                </TooltipTrigger>
                                <TooltipContent>
                                    {reaction.reactions
                                        .map(r => r.user.username)
                                        .join(", ")}
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    ))}
                </div>
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
                    <Button className="w-full">
                        {post.comment_count} Comments
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

export default PostCard;
