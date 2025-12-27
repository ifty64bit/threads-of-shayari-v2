import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { ArrowBigDownDash } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPostsByUserIdOptions } from "@/hooks/api/posts";
import { getUserByIdOptions } from "@/hooks/api/users";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import PostElement from "../feed/-components/PostElement";

export const Route = createFileRoute("/_portal/profile/$userId")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getUserByIdOptions(Number(params.userId)),
		);
	},
});

function RouteComponent() {
	const { userId } = Route.useParams();
	const { data: user } = useSuspenseQuery(getUserByIdOptions(Number(userId)));

	if (!user) {
		return (
			<div className="flex flex-col items-center justify-center py-8">
				<p className="text-muted-foreground">User not found</p>
			</div>
		);
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
						/>
					</div>
				</ClientOnly>
				<h5>{user?.name}</h5>
				<p className="text-sm text-muted-foreground">@{user?.username}</p>
			</section>
			<hr className="my-2" />

			<Suspense fallback={<div>Loading...</div>}>
				<PostsSection userId={Number(userId)} />
			</Suspense>
		</>
	);
}

function PostsSection({ userId }: { userId: number }) {
	const {
		data: posts,
		fetchNextPage,
		hasNextPage,
		isPending,
	} = useSuspenseInfiniteQuery(
		getPostsByUserIdOptions({
			userId,
		}),
	);

	if (!posts?.pages?.[0]?.data?.length) {
		return (
			<div className="flex flex-col items-center justify-center py-8">
				<p className="text-muted-foreground">No posts yet</p>
			</div>
		);
	}

	return (
		<section>
			{posts?.pages.map((page) => (
				<div key={page.data[0]?.id}>
					{page.data.map((post) => (
						<PostElement key={post.id} post={post} />
					))}
				</div>
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
