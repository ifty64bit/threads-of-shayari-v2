import { createFileRoute, Link } from "@tanstack/react-router";
import { getUserSession } from "@/functions/auth";

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => {
		const session = await getUserSession();
		return { session };
	},
});

function App() {
	const { session } = Route.useLoaderData();

	return (
		<main className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
			<h2 className="text-2xl font-bold">Welcome to the</h2>
			<h1 className="text-4xl font-extrabold text-blue-600">
				Threads of Shayari
			</h1>
			{session ? (
				<Link
					to={session.user.isAdmin ? "/dashboard" : "/feed"}
					className="text-lg text-green-600 mt-4 block"
				>
					Go to {session.user.isAdmin ? "Dashboard" : "Feed"}
				</Link>
			) : (
				<Link to="/login" className="text-lg text-red-600 mt-4 block">
					Login to continue
				</Link>
			)}
		</main>
	);
}
