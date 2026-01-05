import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { ArrowBigDownDash, Camera } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPostsByUserIdOptions } from "@/hooks/api/posts";
import {
	getCurrentUserOptions,
	useUpdateCurrentUserImage,
} from "@/hooks/api/users";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import PostElement from "../feed/-components/PostElement";

export const Route = createFileRoute("/_portal/profile/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(getCurrentUserOptions);
	},
});

function RouteComponent() {
	const { data: user } = useSuspenseQuery(getCurrentUserOptions);
	const updaeProfileImage = useUpdateCurrentUserImage();

	async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			updaeProfileImage.mutate(file);
		}
	}

	return (
		<>
			<section className="flex flex-col justify-center items-center mt-4">
				<ClientOnly fallback={<Skeleton className="w-24 h-24 rounded-full" />}>
					<div className="relative">
						<img
							src={getCloudinaryUrl(user?.image)}
							alt={user?.name}
							width={100}
							height={100}
							className="rounded-full w-24 h-24 object-cover"
							title="Ekti Bokachoda"
						/>
						<Button
							variant="ghost"
							className="absolute bottom-0 right-0 bg-accent rounded-full px-1 py-1 size-8"
							onClick={() =>
								document.getElementById("profile-image-input")?.click()
							}
						>
							<Camera />
						</Button>
						<input
							id="profile-image-input"
							type="file"
							className="hidden"
							accept="image/*"
							onChange={handleImageChange}
						/>
					</div>
				</ClientOnly>
				<h5>{user?.name}</h5>
				<p className="text-sm">@{user?.username}</p>
			</section>
			<hr className="my-2" />

			<Suspense fallback={<div>Loading...</div>}>
				<PostsSection />
			</Suspense>
		</>
	);
}

function PostsSection() {
	const { data: user } = useSuspenseQuery(getCurrentUserOptions);

	const {
		data: posts,
		fetchNextPage,
		hasNextPage,
		isPending,
	} = useSuspenseInfiniteQuery(
		getPostsByUserIdOptions({
			userId: Number(user?.id),
		}),
	);

    const flatPosts = posts?.pages.flatMap((page) => page.data) || [];

    if (flatPosts.length === 0) {
        return <p className="text-center text-muted-foreground">No posts yet</p>;
    }

	return (
		<section>
            {flatPosts.map((post) => (
						<PostElement key={post.id} post={post} />
			))}

			{hasNextPage && (
				<div className="w-full flex justify-center py-4">
					<Button
						variant="ghost"
						size={"icon"}
						className="animate-bounce size-8"
						onClick={() => {
							fetchNextPage();
						}}
						isLoading={isPending}
					>
						<ArrowBigDownDash />
					</Button>
				</div>
			)}
		</section>
	);
}
