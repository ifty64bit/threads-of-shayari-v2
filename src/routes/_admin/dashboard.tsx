import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<Link
				to="/users"
				className="relative flex items-center justify-between max-w-xs w-full aspect-video border rounded-2xl p-4 group/card hover:bg-muted/50 hover:shadow-md transition-color transition-shadow duration-500 ease-in-out"
			>
				<h5 className="absolute inset-0 flex items-center justify-center group-hover/card:opacity-0 transition-all duration-500 ease-in-out">
					Total Users
				</h5>
				<p className="absolute inset-0 flex items-center justify-center group-hover/card:opacity-100 opacity-0 transition-all duration-500 ease-in-out">
					100
				</p>
			</Link>
		</div>
	);
}
