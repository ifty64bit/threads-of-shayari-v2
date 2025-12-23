import { SmilePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { getPosts } from "@/functions/posts";
import { useReactionMutation } from "@/hooks/api/reactions";
import { authClient } from "@/lib/auth-client";
import { REACTIONS, type ReactionType } from "@/lib/reactions";

type ReactionsProps = {
	post: Awaited<ReturnType<typeof getPosts>>["data"][number];
};

function Reactions({ post }: ReactionsProps) {
	const [popoverOpen, setPopoverOpen] = useState(false);
	const reactionMutation = useReactionMutation();
	const { data: session } = authClient.useSession();

	const userId = session?.user?.id;
	const userReaction = userId
		? post.reactions.find((r) => r.userId === Number(userId))
		: null;
	const reactionCounts = post.reactions.reduce(
		(acc, r) => {
			acc[r.reaction as ReactionType] =
				(acc[r.reaction as ReactionType] || 0) + 1;
			return acc;
		},
		{} as Record<ReactionType, number>,
	);

	function handleReaction(reaction: ReactionType) {
		if (!userId) return;
		reactionMutation.mutate(
			{ postId: post.id, userId: Number(userId), reaction },
			{
				onSuccess: () => setPopoverOpen(false),
			},
		);
	}

	return (
		<div className="flex items-center gap-1">
			{/* Feature 1: React Button - Opens popover to add/change reaction */}
			<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						disabled={reactionMutation.isPending || !userId}
						className=""
					>
						{userReaction ? (
							<span className="text-xl">
								{REACTIONS[userReaction.reaction as ReactionType]}
							</span>
						) : (
							<SmilePlus
								size={20}
								className="text-muted-foreground hover:text-primary transition-colors"
							/>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-2" side="top" align="start">
					<div className="flex gap-1">
						{(Object.keys(REACTIONS) as ReactionType[]).map((key) => (
							<button
								type="button"
								key={key}
								onClick={() => handleReaction(key)}
								className={`p-2 text-2xl rounded-lg transition-all hover:scale-110 hover:bg-muted ${
									userReaction?.reaction === key
										? "bg-primary/20 ring-2 ring-primary scale-110"
										: ""
								}`}
								title={key.replace(/_/g, " ")}
							>
								{REACTIONS[key]}
							</button>
						))}
					</div>
				</PopoverContent>
			</Popover>

			{/* Feature 2: Reaction Display - Shows stacked emojis with individual counts */}
			{post.reactions.length > 0 && (
				<div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
					{(Object.entries(reactionCounts) as [ReactionType, number][]).map(
						([reaction, count]) => (
							<span
								key={reaction}
								className="flex items-center gap-0.5 text-sm"
								title={`${count} ${reaction.replace(/_/g, " ")}`}
							>
								<span className="text-base">{REACTIONS[reaction]}</span>
								<span className="text-xs font-medium text-muted-foreground">
									{count}
								</span>
							</span>
						),
					)}
				</div>
			)}
		</div>
	);
}

export default Reactions;
