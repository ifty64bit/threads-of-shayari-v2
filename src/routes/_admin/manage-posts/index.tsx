import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	getPostsForAdminOptions,
	useAdminDeletePostMutation,
} from "@/hooks/api/posts";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export const Route = createFileRoute("/_admin/manage-posts/")({
	validateSearch: z.object({
		limit: z.number().optional().default(10),
		offset: z.number().optional().default(0),
		search: z.string().optional(),
	}),
	loaderDeps: ({ search }) => ({
		limit: search.limit,
		offset: search.offset,
		search: search.search,
	}),
	loader: async ({ deps, context }) => {
		await context.queryClient.ensureQueryData(getPostsForAdminOptions(deps));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { limit, offset, search } = Route.useSearch();
	const navigate = Route.useNavigate();

	const { data } = useSuspenseQuery(
		getPostsForAdminOptions({
			limit,
			offset,
			search,
		}),
	)

	const deletePost = useAdminDeletePostMutation();

	const { posts, total } = data;
	const currentPage = Math.floor(offset / limit) + 1;
	const totalPages = Math.ceil(total / limit);

	const goToPage = (page: number) => {
		navigate({
			search: {
				limit,
				offset: (page - 1) * limit,
				search,
			},
		})
	}

	const getVisiblePages = () => {
		const pages: number[] = [];
		const maxVisible = 5;
		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		const end = Math.min(totalPages, start + maxVisible - 1);

		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		return pages;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Posts</h1>
				<p className="text-muted-foreground">{total} total posts</p>
			</div>

			<Table>
				<TableHeader>
					<TableRow className="text-center">
						<TableHead className="w-24 text-center">ID</TableHead>
						<TableHead className="text-center">Author</TableHead>
						<TableHead className="text-center max-w-xs">Content</TableHead>
						<TableHead className="text-center">Images</TableHead>
						<TableHead className="text-center">Reactions</TableHead>
						<TableHead className="text-center">Comments</TableHead>
						<TableHead className="text-center">Created</TableHead>
						<TableHead className="text-center">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{posts.map((post) => (
						<TableRow key={post.id}>
							<TableCell className="font-medium text-center">
								{post.id}
							</TableCell>
							<TableCell>
								<Link
									to="/users/$userId"
									params={{ userId: post.author.id.toString() }}
									className="flex items-center gap-2 hover:underline"
								>
									{post.author.image ? (
										<img
											src={getCloudinaryUrl(post.author.image)}
											alt={post.author.name}
											className="h-8 w-8 rounded-full object-cover"
										/>
									) : (
										<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
											{post.author.name.charAt(0).toUpperCase()}
										</div>
									)}
									<div className="text-left">
										<p className="font-medium text-sm">{post.author.name}</p>
										<p className="text-xs text-muted-foreground">
											@{post.author.username}
										</p>
									</div>
								</Link>
							</TableCell>
							<TableCell className="max-w-xs">
								<p className="truncate text-sm">{post.content}</p>
							</TableCell>
							<TableCell className="text-center">
								{post.images.length}
							</TableCell>
							<TableCell className="text-center">
								{post.reactions.length}
							</TableCell>
							<TableCell className="text-center">
								{post.comments.length}
							</TableCell>
							<TableCell className="text-center text-sm">
								{dayjs(post.createdAt).format("D MMM YYYY")}
							</TableCell>
							<TableCell className="text-center">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem asChild>
											<Link
												to="/posts/$postId"
												params={{ postId: String(post.id) }}
											>
												<Eye className="h-4 w-4 mr-2" />
												View Post
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem
											variant="destructive"
											onClick={() => deletePost.mutate({ postId: post.id })}
										>
											<Trash2 className="h-4 w-4 mr-2" />
											Delete Post
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{posts.length === 0 && (
				<div className="text-center py-8 text-muted-foreground">
					No posts found
				</div>
			)}

			{totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => goToPage(currentPage - 1)}
								aria-disabled={currentPage <= 1}
								className={
									currentPage <= 1
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>

						{getVisiblePages().map((page) => (
							<PaginationItem key={page}>
								<PaginationLink
									onClick={() => goToPage(page)}
									isActive={page === currentPage}
									className="cursor-pointer"
								>
									{page}
								</PaginationLink>
							</PaginationItem>
						))}

						<PaginationItem>
							<PaginationNext
								onClick={() => goToPage(currentPage + 1)}
								aria-disabled={currentPage >= totalPages}
								className={
									currentPage >= totalPages
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	)
}
