export const REACTIONS = {
	like: "👍",
	love: "❤️",
	haha: "😂",
	wow: "😮",
	sad: "😢",
	angry: "😡",
} as const;

export type ReactionType = keyof typeof REACTIONS;
