import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { REACTION_TYPES } from "../../../api/src/db/schemas";
import { useReactToPost } from "@/api/post.api";

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

type ReactBtnProps = {
    post: {
        reactions: any[];
        id: number;
        content: string;
        authorId: number;
        createdAt: string;
        updatedAt: string;
        author: {
            id: number;
            name: string;
            username: string;
            avatar: string | null;
            email: string;
        } | null;
    };
};

function ReactBtn({ post }: ReactBtnProps) {
    const reactToPost = useReactToPost();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="flex-1">React</Button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                className="flex w-fit gap-2 border-0 bg-transparent p-0 shadow-none"
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
