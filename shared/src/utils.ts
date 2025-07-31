export function getEmojiForReaction(type: string) {
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

export const REACTION_TYPES = ["dhon", "horny", "wet", "pussy", "cum"] as const;
