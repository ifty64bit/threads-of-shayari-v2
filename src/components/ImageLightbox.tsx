import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { getCloudinaryUrl } from "@/lib/cloudinary";

interface ImageLightboxProps {
	images: { id: number; url: string }[];
	initialImageIndex: number;
	children: React.ReactNode;
}

export function ImageLightbox({
	images,
	initialImageIndex,
	children,
}: ImageLightboxProps) {
	const currentImage = images[initialImageIndex];

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className="max-w-5xl w-full h-[80vh] sm:h-[90vh] p-0 gap-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-hidden"
				showCloseButton={true}
			>
				<DialogTitle className="sr-only">View Image</DialogTitle>
				<div className="relative w-full h-full flex items-center justify-center">
					<img
						src={getCloudinaryUrl(currentImage.url) ?? ""}
						alt="Post attachment"
						className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
