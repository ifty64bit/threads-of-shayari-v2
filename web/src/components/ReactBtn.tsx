import type { InferResponseType } from "hono/client";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { REACTION_TYPES } from "../../../api/src/db/schemas";
import { useReactToPost } from "@/api/post.api";
import type api from "@/lib/api";
import { cn } from "@/lib/utils";

const reacts = REACTION_TYPES.map(type => ({
    label: type,
    emoji: getEmojiForReaction(type),
}));

function getEmojiForReaction(type: string) {
    switch (type) {
        case "dhon":
            return "🍆";
        case "horny":
            return "🥵";
        case "wet":
            return "💦";
        case "pussy":
            return "🐱";
        case "cum":
            return "🌊";
        default:
            return "❓";
    }
}

type ReactionType = InferResponseType<
    typeof api.posts.$get
>["data"][number]["reactions"][number];

type ReactBtnProps = {
    post: {
        id: number;
        reactions: ReactionType[];
    };
    className?: string;
};

function ReactBtn({ post, className }: ReactBtnProps) {
    const reactToPost = useReactToPost();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className={cn("flex-1", className)}>React</Button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                className={
                    "flex w-fit gap-2 border-0 bg-transparent p-0 shadow-none"
                }
            >
                {reacts.map(react => (
                    <Button
                        key={react.label}
                        variant="ghost"
                        className="flex flex-col items-center justify-center rounded-full border bg-transparent p-2 text-xl backdrop-blur hover:-translate-y-1 hover:shadow-md"
                        title={react.label}
                        onClick={() => {
                            reactToPost.mutate({
                                postId: post.id.toString(),
                                reaction: react.label,
                            });
                        }}
                    >
                        {
                            post.reactions.filter(
                                reaction => reaction.type === react.label
                            )?.length
                        }{" "}
                        {react.emoji}
                    </Button>
                ))}
            </PopoverContent>
        </Popover>
    );
}

export default ReactBtn;
