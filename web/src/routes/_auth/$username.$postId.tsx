import { getPostById, useCreateComment } from "@/api/post.api";
import Comments from "@/components/Comments";
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
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

export const Route = createFileRoute("/_auth/$username/$postId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { postId } = Route.useParams();

    const {
        data: { data: post },
    } = useSuspenseQuery(getPostById(postId));

    const postComment = useCreateComment();

    const form = useForm<z.infer<typeof commentSchema>>({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            content: "",
        },
    });

    return (
        <div>
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
                <CardFooter className="flex flex-col items-stretch gap-4 border-y py-2">
                    <ReactBtn post={post} className="border-y" />
                </CardFooter>
                <div className="flex flex-col gap-4 px-4">
                    <Form {...form}>
                        <form
                            className="flex flex-col gap-2"
                            onSubmit={form.handleSubmit(data =>
                                postComment.mutate(
                                    { postId, ...data },
                                    {
                                        onSuccess: () => {
                                            form.reset();
                                        },
                                    }
                                )
                            )}
                        >
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <Textarea
                                            placeholder="Add a comment..."
                                            {...field}
                                        />
                                    </FormItem>
                                )}
                            />
                            <Button className="self-end">Comment</Button>
                        </form>
                    </Form>

                    <Comments />
                </div>
            </Card>
        </div>
    );
}

const commentSchema = z.object({
    content: z.string().min(2).max(500),
});
