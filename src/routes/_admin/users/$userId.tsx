import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
	ArrowLeft,
	Calendar,
	CheckCircle,
	Mail,
	MessageSquare,
	MoreHorizontal,
	ScrollText,
	Trash2,
	User,
	XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDeleteCommentMutation } from "@/hooks/api/comments";
import { useAdminDeletePostMutation } from "@/hooks/api/posts";
import { getAdminUserDetailOptions } from "@/hooks/api/users";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export const Route = createFileRoute("/_admin/users/$userId")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			getAdminUserDetailOptions(Number(params.userId)),
		);
	},
});

function RouteComponent() {
	const { userId } = Route.useParams();
	const { data: user } = useSuspenseQuery(
		getAdminUserDetailOptions(Number(userId)),
	);

	const deletePost = useAdminDeletePostMutation();
	const deleteComment = useAdminDeleteCommentMutation();

	if (!user) {
		return (
			<div className="p-8 text-center">
				<p className="text-muted-foreground">User not found</p>
				<Link to="/users">
					<Button variant="outline" className="mt-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Users
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="p-4 md:p-6 space-y-6">
			{/* Header with Back Button */}
			<div className="flex items-center gap-4">
				<Link to="/users">
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-5 w-5" />
					</Button>
				</Link>
				<h1 className="text-2xl font-bold">User Details</h1>
			</div>

			{/* User Profile Card */}
			<div className="card-elevated p-6">
				<div className="flex flex-col sm:flex-row gap-6 items-start">
					{/* Avatar */}
					<ClientOnly
						fallback={<Skeleton className="w-24 h-24 rounded-full" />}
					>
						<img
							src={getCloudinaryUrl(user.image)}
							alt={user.name}
							className="w-24 h-24 rounded-full object-cover ring-4 ring-background shadow-lg"
						/>
					</ClientOnly>

					{/* User Info */}
					<div className="flex-1 space-y-3">
						<div>
							<h2 className="text-xl font-semibold flex items-center gap-2">
								{user.name}
								{user.emailVerified ? (
									<span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-600">
										<CheckCircle className="h-3 w-3" /> Approved
									</span>
								) : (
									<span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-600">
										<XCircle className="h-3 w-3" /> Pending
									</span>
								)}
							</h2>
							<p className="text-muted-foreground">@{user.username}</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Mail className="h-4 w-4" />
								<span>{user.email}</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<Calendar className="h-4 w-4" />
								<span>Joined {dayjs(user.createdAt).format("D MMM YYYY")}</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<ScrollText className="h-4 w-4" />
								<span>{user.posts?.length ?? 0} Posts</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<MessageSquare className="h-4 w-4" />
								<span>{user.comments?.length ?? 0} Comments</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Tabs Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Posts Section */}
				<div className="card-elevated p-4">
					<h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
						<ScrollText className="h-5 w-5" />
						Recent Posts ({user.posts?.length ?? 0})
					</h3>
					<div className="space-y-3 max-h-[500px] overflow-y-auto">
						{user.posts && user.posts.length > 0 ? (
							user.posts.map((post) => (
								<div
									key={post.id}
									className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
								>
									<Link
										to="/posts/$postId"
										params={{ postId: post.id.toString() }}
										className="flex-1 hover:opacity-80 transition-opacity"
									>
										<p className="line-clamp-2 text-sm">{post.content}</p>
										<span className="text-xs text-muted-foreground mt-1 block">
											{dayjs(post.createdAt).format("D MMM YYYY h:mmA")}
										</span>
									</Link>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="shrink-0">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												variant="destructive"
												onClick={() => deletePost.mutate({ postId: post.id })}
											>
												<Trash2 className="h-4 w-4 mr-2" />
												Delete Post
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							))
						) : (
							<div className="text-center py-8 text-muted-foreground">
								<ScrollText className="h-8 w-8 mx-auto mb-2 opacity-50" />
								<p>No posts yet</p>
							</div>
						)}
					</div>
				</div>

				{/* Comments Section */}
				<div className="card-elevated p-4">
					<h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
						<MessageSquare className="h-5 w-5" />
						Recent Comments ({user.comments?.length ?? 0})
					</h3>
					<div className="space-y-3 max-h-[500px] overflow-y-auto">
						{user.comments && user.comments.length > 0 ? (
							user.comments.map((comment) => (
								<div
									key={comment.id}
									className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
								>
									<Link
										to="/posts/$postId"
										params={{ postId: comment.post.id.toString() }}
										className="flex-1 hover:opacity-80 transition-opacity"
									>
										<p className="line-clamp-2 text-sm">
											{comment.content || (
												<span className="italic text-muted-foreground">
													Audio comment
												</span>
											)}
										</p>
										<div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
											<User className="h-3 w-3" />
											<span className="line-clamp-1 flex-1">
												On: {comment.post.content?.slice(0, 40)}
												{(comment.post.content?.length ?? 0) > 40 ? "..." : ""}
											</span>
										</div>
										<span className="text-xs text-muted-foreground mt-1 block">
											{dayjs(comment.createdAt).format("D MMM YYYY h:mmA")}
										</span>
									</Link>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="shrink-0">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												variant="destructive"
												onClick={() =>
													deleteComment.mutate({ commentId: comment.id })
												}
											>
												<Trash2 className="h-4 w-4 mr-2" />
												Delete Comment
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							))
						) : (
							<div className="text-center py-8 text-muted-foreground">
								<MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
								<p>No comments yet</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
