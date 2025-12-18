import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ImageUp, SendHorizontal } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { createPost } from "@/functions/posts";
import { getCloudinarySignature } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

const postSchema = z.object({
	content: z.string().min(1, "Post cannot be empty").max(280),
	images: z.array(z.instanceof(File)).max(4).optional(),
});
type PostType = z.infer<typeof postSchema>;

function PostInput() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const form = useForm<PostType>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			content: "",
			images: [],
		},
	});
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const contentCount = form.watch("content").length;

	const handleInput = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	};

	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const files = event.target.files;
		if (files) {
			const urls = Array.from(files);
			form.setValue("images", urls);
		}
		event.target.value = "";
	}

	const onSubmit = async (data: PostType) => {
		try {
			const signature = await getCloudinarySignature({
				data: {
					folder: "threads_of_shayari_posts",
				},
			});
			let imageUrls: string[] = [];
			if (data.images && data.images.length > 0) {
				const uploadPromises = data.images.map(async (image) => {
					const formData = new FormData();
					formData.append("file", image);
					formData.append("api_key", signature.apiKey as string);
					formData.append("timestamp", signature.timestamp.toString());
					formData.append("folder", signature.folder);
					formData.append("signature", signature.signature);
					const res = await fetch(
						`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
						{
							method: "POST",
							body: formData,
						},
					);
					const data = await res.json();
					return data.public_id as string;
				});
				imageUrls = await Promise.all(uploadPromises);
			}
			await createPost({
				data: { content: data.content.trim(), images: imageUrls },
			});
			toast.success("Post created!");
			form.reset();
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
			queryClient.invalidateQueries({
				queryKey: ["posts"],
			});
		} catch (error) {
			toast.error("Failed to create post");
			console.error(error);
		}
	};

	return (
		<section className="border-b group transition-all duration-300 ease-in-out">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="content"
						render={({ field }) => (
							<FormItem className="min-h-20 flex items-center py-4 space-y-0">
								<FormControl>
									<textarea
										{...field}
										ref={(e) => {
											field.ref(e);
											textareaRef.current = e;
										}}
										id="post-input"
										placeholder="What's on your mind?"
										className="w-full min-h-6 max-h-50 px-4 outline-none bg-transparent resize-none overflow-hidden"
										onBlur={handleInput}
										rows={1}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div
						className={cn(
							"h-0 flex justify-between items-center overflow-hidden transition-all duration-300 ease-in-out px-2",
							"group-focus-within:h-12",
							(contentCount > 0 || (form.watch("images")?.length ?? 0) > 0) &&
								"h-12",
						)}
					>
						<input
							id="file-input"
							type="file"
							hidden
							onChange={handleFileChange}
						/>
						<div className="flex items-center">
							<Button
								variant={"ghost"}
								size="sm"
								onClick={() => document.getElementById("file-input")?.click()}
								type="button"
							>
								<ImageUp />
							</Button>

							{form.watch("images")?.map((image) => (
								<img
									key={image.name}
									src={URL.createObjectURL(image)}
									alt={image.name}
									className="border w-8 h-8 rounded-md object-cover ml-2"
								/>
							))}
						</div>

						<Button
							variant={"ghost"}
							size="sm"
							disabled={!form.formState.isValid || form.formState.isSubmitting}
							type="submit"
						>
							<SendHorizontal />
						</Button>
					</div>
				</form>
			</Form>
		</section>
	);
}

export default PostInput;
