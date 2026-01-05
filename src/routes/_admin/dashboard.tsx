import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowRight,
	FileText,
	Heart,
	MessageCircle,
	Music,
	Users,
} from "lucide-react";
import { getDashboardStats } from "@/data/functions/dashboard";
import { getCloudinaryUrl } from "../../lib/cloudinary";

export const Route = createFileRoute("/_admin/dashboard")({
	component: RouteComponent,
	loader: () => getDashboardStats(),
});

interface StatCardProps {
	title: string;
	value: number;
	icon: React.ReactNode;
	href: string;
	gradient: string;
}

function StatCard({ title, value, icon, href, gradient }: StatCardProps) {
	return (
		<Link
			to={href}
			className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
		>
			{/* Background gradient */}
			<div
				className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`}
			/>

			{/* Content */}
			<div className="relative z-10">
				<div className="flex items-center justify-between">
					<div className="rounded-xl bg-muted/50 p-3 backdrop-blur-sm group-hover:bg-background/50 transition-colors duration-300">
						{icon}
					</div>
					<ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
				</div>

				<div className="mt-4">
					<p className="text-3xl font-bold tracking-tight">
						{value.toLocaleString()}
					</p>
					<p className="mt-1 text-sm text-muted-foreground font-medium">
						{title}
					</p>
				</div>
			</div>
		</Link>
	);
}

function RouteComponent() {
	const data = Route.useLoaderData();

	const stats = [
		{
			title: "Total Users",
			value: data.totalUsers,
			icon: <Users className="h-6 w-6 text-blue-500" />,
			href: "/users",
			gradient:
				"bg-gradient-to-br from-blue-500/10 via-transparent to-transparent",
		},
		{
			title: "Total Posts",
			value: data.totalPosts,
			icon: <FileText className="h-6 w-6 text-emerald-500" />,
			href: "/manage-posts",
			gradient:
				"bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent",
		},
		{
			title: "Total Comments",
			value: data.totalComments,
			icon: <MessageCircle className="h-6 w-6 text-purple-500" />,
			href: "/dashboard",
			gradient:
				"bg-gradient-to-br from-purple-500/10 via-transparent to-transparent",
		},
		{
			title: "Audio Presets",
			value: data.totalAudioPresets,
			icon: <Music className="h-6 w-6 text-amber-500" />,
			href: "/audio-presets",
			gradient:
				"bg-gradient-to-br from-amber-500/10 via-transparent to-transparent",
		},
		{
			title: "Total Reactions",
			value: data.totalReactions,
			icon: <Heart className="h-6 w-6 text-rose-500" />,
			href: "/dashboard",
			gradient:
				"bg-gradient-to-br from-rose-500/10 via-transparent to-transparent",
		},
	];

	return (
		<div className="space-y-8 py-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="mt-1 text-muted-foreground">
					Welcome back! Here's an overview of your platform.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				{stats.map((stat) => (
					<StatCard key={stat.title} {...stat} />
				))}
			</div>

			{/* Recent Users */}
			<div className="rounded-2xl border border-border/50 bg-card p-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold tracking-tight">
							Recent Users
						</h2>
						<p className="text-sm text-muted-foreground">
							Latest users who joined the platform
						</p>
					</div>
					<Link
						to="/users"
						className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
					>
						View all
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>

				<div className="mt-6 space-y-4">
					{data.recentUsers.map((user) => (
						<Link
							key={user.id}
							to="/users/$userId"
							params={{ userId: String(user.id) }}
							className="flex items-center gap-4 rounded-xl p-3 -mx-3 transition-colors hover:bg-muted/50"
						>
							<img
								src={getCloudinaryUrl(user.image)}
								alt={user.name}
								className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
							/>

							<div className="flex-1 min-w-0">
								<p className="font-medium truncate">{user.name}</p>
								<p className="text-sm text-muted-foreground truncate">
									@{user.username}
								</p>
							</div>
							<div className="text-xs text-muted-foreground">
								{user.createdAt
									? new Date(user.createdAt).toLocaleDateString()
									: "N/A"}
							</div>
						</Link>
					))}

					{data.recentUsers.length === 0 && (
						<p className="text-center text-sm text-muted-foreground py-8">
							No users yet
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
