import { createFileRoute, redirect } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import dayjs from "dayjs";
import { getUserSession } from "@/data/functions/auth";
import { getPublicPostById } from "@/data/functions/posts";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { config } from "@/lib/config";

export const Route = createFileRoute("/share/posts/$postId")({
	component: PublicPostView,
	loader: async ({ params }) => {
		// Check if user is logged in
		const session = await getUserSession();
		if (session?.user) {
			// Redirect authenticated users to private route
			throw redirect({
				to: "/posts/$postId",
				params: { postId: params.postId },
			});
		}

		const post = await getPublicPostById({
			data: { postId: Number(params.postId) },
		});

		// If post doesn't exist or has no ogImage (not shared), redirect to login
		if (!post) {
			throw redirect({ to: "/login" });
		}

		return { post };
	},
	head: ({ loaderData }) => {
		const post = loaderData?.post;
		const title = post
			? `${post.author.name} (@${post.author.username})`
			: "Post";
		const description = post?.content?.slice(0, 160) || "";
		const ogImageUrl = post?.ogImage
			? getCloudinaryUrl(post.ogImage)
			: undefined;

		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "article" },
				...(ogImageUrl ? [{ property: "og:image", content: ogImageUrl }] : []),
				{
					name: "twitter:card",
					content: ogImageUrl ? "summary_large_image" : "summary",
				},
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				...(ogImageUrl ? [{ name: "twitter:image", content: ogImageUrl }] : []),
			],
		};
	},
});

function PublicPostView() {
	const { post } = Route.useLoaderData();

	return (
		<main className="min-h-dvh bg-linear-to-br from-primary/10 via-background to-primary/5">
			{/* Header */}
			<header className="sticky top-0 bg-background/80 backdrop-blur-md border-b py-3 px-4 z-50">
				<div className="max-w-md mx-auto flex justify-between items-center">
					<h4 className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent font-bold">
						{config.BRAND_NAME}
					</h4>
					<a
						href="/login"
						className="text-sm font-medium text-primary hover:underline"
					>
						Login to see more
					</a>
				</div>
			</header>

			{/* Post Card */}
			<div className="max-w-md mx-auto p-4">
				<article className="bg-card rounded-2xl shadow-lg overflow-hidden">
					{/* Author Header */}
					<div className="flex items-center gap-3 bg-muted/50 px-4 pt-4 pb-3">
						<img
							src={getCloudinaryUrl(post.author.image)}
							alt={post.author.name}
							className="rounded-full size-12 object-cover ring-2 ring-background"
						/>
						<div>
							<h6 className="font-semibold">{post.author.name}</h6>
							<p className="text-muted-foreground text-xs">
								@{post.author.username}
							</p>
						</div>
					</div>

					{/* Content */}
					<div className="px-4 py-4">
						<p className="whitespace-pre-wrap text-base leading-relaxed">
							{post.content}
						</p>

						{/* Post Images */}
						{post.images && post.images.length > 0 && (
							<div className="mt-4 flex gap-2 overflow-x-auto">
								{post.images.map((img) => (
									<Image
										key={img.id}
										cdn="cloudinary"
										layout="constrained"
										width={600}
										height={338}
										src={getCloudinaryUrl(img.url) ?? ""}
										alt="Post attachment"
										className="rounded-xl max-h-80 w-full object-cover"
									/>
								))}
							</div>
						)}

						{/* Timestamp */}
						<p className="text-xs text-muted-foreground mt-4">
							{dayjs(post.createdAt).format("D MMM YYYY, h:mm A")}
						</p>
					</div>
				</article>

				{/* CTA */}
				<div className="mt-6 text-center">
					<p className="text-muted-foreground text-sm mb-3">
						Join {config.BRAND_NAME} to react and comment
					</p>
					<a
						href="/signup"
						className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-primary/90 transition-colors"
					>
						Sign Up Free
					</a>
				</div>
			</div>

			{/* Footer */}
			<footer className="py-6 text-center text-sm text-muted-foreground">
				© 2025 {config.BRAND_NAME}. All rights reserved.
			</footer>
		</main>
	);
}
