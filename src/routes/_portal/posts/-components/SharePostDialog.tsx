import {
	Download,
	Facebook,
	Instagram,
	type LucideIcon,
	MessageCircle,
	Send,
} from "lucide-react";
import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { generatePostCard } from "@/functions/share";
import { config } from "@/lib/config";
import { getCloudinaryUrl } from "@/lib/cloudinary";

type SharePostDialogProps = {
	post: {
		id: number;
		content: string;
		author: {
			name: string;
			username: string;
			image: string | null;
		};
		images?: { id: number; url: string }[];
	};
	trigger: React.ReactNode;
};

type ShareButtonConfig = {
	id: string;
	icon: LucideIcon;
	label: string;
	hoverClass: string;
};

const SHARE_BUTTONS: ShareButtonConfig[] = [
	{
		id: "whatsapp",
		icon: MessageCircle,
		label: "WhatsApp",
		hoverClass:
			"hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-600",
	},
	{
		id: "facebook",
		icon: Facebook,
		label: "Facebook",
		hoverClass:
			"hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-600",
	},
	{
		id: "instagram",
		icon: Instagram,
		label: "Instagram",
		hoverClass:
			"hover:bg-pink-500/10 hover:border-pink-500/50 hover:text-pink-600",
	},
	{
		id: "telegram",
		icon: Send,
		label: "Telegram",
		hoverClass:
			"hover:bg-sky-500/10 hover:border-sky-500/50 hover:text-sky-600",
	},
];

const ShareButton = memo(function ShareButton({
	config,
	onClick,
	disabled,
}: {
	config: ShareButtonConfig;
	onClick: () => void;
	disabled: boolean;
}) {
	const Icon = config.icon;
	return (
		<Button
			variant="outline"
			className={`flex flex-col items-center gap-1 h-auto py-3 ${config.hoverClass}`}
			onClick={onClick}
			disabled={disabled}
		>
			<Icon className="h-6 w-6" />
			<span className="text-xs">{config.label}</span>
		</Button>
	);
});

export const SharePostDialog = memo(function SharePostDialog({
	post,
	trigger,
}: SharePostDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedImage, setGeneratedImage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleGenerateImage = useCallback(async () => {
		if (generatedImage) return generatedImage;

		setIsGenerating(true);
		setError(null);
		try {
			const imageData = await generatePostCard({ data: { postId: post.id } });
			setGeneratedImage(imageData ?? null);
			return imageData ?? null;
		} catch (err) {
			console.error("Failed to generate image:", err);
			setError("Failed to generate image");
			return null;
		} finally {
			setIsGenerating(false);
		}
	}, [generatedImage, post.id]);

	const downloadImage = useCallback(
		async (imageData: string) => {
			try {
				const response = await fetch(getCloudinaryUrl(imageData) as string);
				const blob = await response.blob();
				const pngBlob = new Blob([blob], { type: "image/png" });
				const url = URL.createObjectURL(pngBlob);

				const link = document.createElement("a");
				link.download = `${config.BRAND_NAME}-${post.author.username}-${post.id}.png`;
				link.href = url;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				setTimeout(() => URL.revokeObjectURL(url), 100);
			} catch (_err) {
				const link = document.createElement("a");
				link.download = `${config.BRAND_NAME}-${post.author.username}-${post.id}.png`;
				link.href = imageData;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		},
		[post.id, post.author.username],
	);

	const handleDownload = useCallback(async () => {
		const imageData = await handleGenerateImage();
		if (imageData) await downloadImage(imageData);
	}, [handleGenerateImage, downloadImage]);

	const getShareText = useCallback(() => {
		return encodeURIComponent(
			`${post.content}\n\n- ${post.author.name} (@${post.author.username})`,
		);
	}, [post.content, post.author.name, post.author.username]);

	const getShareUrl = useCallback(() => {
		const baseUrl = window.location.origin;
		return `${baseUrl}/share/posts/${post.id}`;
	}, [post.id]);

	const handleShare = useCallback(
		async (platform: string) => {
			await handleDownload();
			const shareUrl = encodeURIComponent(getShareUrl());

			switch (platform) {
				case "whatsapp":
					window.open(
						`https://wa.me/?text=${getShareText()}%0A${shareUrl}`,
						"_blank",
					);
					break;
				case "facebook":
					window.open(
						`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
						"_blank",
					);
					break;
				case "instagram":
					alert(
						"Image downloaded! Open Instagram and share from your gallery.",
					);
					break;
				case "telegram":
					window.open(
						`https://t.me/share/url?url=${shareUrl}&text=${getShareText()}`,
						"_blank",
					);
					break;
			}
		},
		[handleDownload, getShareText, getShareUrl],
	);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			setIsOpen(open);
			if (open && !generatedImage) {
				handleGenerateImage();
			}
		},
		[generatedImage, handleGenerateImage],
	);

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share Post</DialogTitle>
				</DialogHeader>

				{/* Post Card Preview */}
				<div className="flex justify-center p-4 bg-muted/30 rounded-lg min-h-[300px] items-center">
					{isGenerating ? (
						<div className="flex flex-col items-center gap-2">
							<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
							<p className="text-sm text-muted-foreground">
								Generating card...
							</p>
						</div>
					) : error ? (
						<div className="flex flex-col items-center gap-2">
							<p className="text-sm text-destructive">{error}</p>
							<Button variant="outline" size="sm" onClick={handleGenerateImage}>
								Retry
							</Button>
						</div>
					) : generatedImage ? (
						<img
							src={getCloudinaryUrl(generatedImage)}
							alt="Share card preview"
							className="max-w-full max-h-[400px] rounded-lg shadow-lg"
						/>
					) : (
						<p className="text-sm text-muted-foreground">Loading preview...</p>
					)}
				</div>

				{/* Share Options */}
				<div className="grid grid-cols-4 gap-3 pt-2">
					{SHARE_BUTTONS.map((config) => (
						<ShareButton
							key={config.id}
							config={config}
							onClick={() => handleShare(config.id)}
							disabled={isGenerating}
						/>
					))}
				</div>

				{/* Download Button */}
				<Button
					variant="secondary"
					className="w-full mt-2"
					onClick={handleDownload}
					disabled={isGenerating}
				>
					<Download className="h-4 w-4 mr-2" />
					{isGenerating ? "Generating..." : "Download Image"}
				</Button>
			</DialogContent>
		</Dialog>
	);
});
