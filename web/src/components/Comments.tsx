import { getCommentsByPostId } from "@/api/post.api";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

function Comments() {
    const { postId } = useParams({
        from: "/_auth/$username/$postId",
    });

    const {
        data: { pages },
        isSuccess,
    } = useSuspenseInfiniteQuery(getCommentsByPostId(postId));

    const comments = pages.flatMap(page => page.data);

    return (
        <ul>
            {isSuccess && comments.length === 0 ? (
                <li className="text-muted-foreground text-center">
                    No comments yet
                </li>
            ) : (
                comments.map(comment => (
                    <li
                        key={comment.id}
                        className="flex items-center gap-4 border-b py-2"
                    >
                        <span className="mt-1 self-start">
                            {comment.author.avatar ? (
                                <img
                                    src={comment.author.avatar}
                                    alt={comment.author.username}
                                    className="h-6 w-6 rounded-full border"
                                />
                            ) : (
                                <UserRound className="h-6 w-6 rounded-full border" />
                            )}
                        </span>
                        <span>
                            <h5>{comment.author.username}</h5>
                            <p className="text-sm whitespace-pre-wrap">
                                {comment.content}
                            </p>
                        </span>
                    </li>
                ))
            )}
        </ul>
    );
}

Comments.Loader = function () {
    return (
        <ul>
            {Array.from({ length: 3 }).map((_, index) => (
                <li
                    key={index}
                    className="flex items-center gap-4 border-b py-2"
                >
                    <span className="mt-1 self-start">
                        <Skeleton className="h-6 w-6 rounded-full border" />
                    </span>
                    <span>
                        <Skeleton className="mb-2 h-4 w-24 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </span>
                </li>
            ))}
        </ul>
    );
};

export default Comments;
