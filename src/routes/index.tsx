import { createFileRoute, Link } from "@tanstack/react-router";
import { getUserSession } from "@/data/functions/auth";
import { config } from "@/lib/config";

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => {
		const session = await getUserSession();
		return { session };
	},
});

import { Heart, Image as ImageIcon, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";

function App() {
	const { session } = Route.useLoaderData();

	return (
		<div className="min-h-screen flex flex-col">
			{/* Hero Section */}
			<section className="bg-gradient-to-b from-background to-muted/50 py-20 px-4">
				<div className="container mx-auto max-w-4xl text-center space-y-6">
					<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						{config.BRAND_NAME}
					</h1>
					<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						A sanctuary for your thoughts, poetry, and visual stories. Connect
						with kindred spirits in a space designed for expression.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
						{session ? (
							<Button
								asChild
								size="lg"
								className="text-lg px-8 h-12 rounded-full"
							>
								<Link to={session.user.isAdmin ? "/dashboard" : "/feed"}>
									Go to {session.user.isAdmin ? "Dashboard" : "Feed"}
								</Link>
							</Button>
						) : (
							<>
								<Button
									asChild
									size="lg"
									className="text-lg px-8 h-12 rounded-full"
								>
									<Link to="/signup">Start Writing</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg"
									className="text-lg px-8 h-12 rounded-full"
								>
									<Link to="/login">Login</Link>
								</Button>
							</>
						)}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 px-4 grid md:grid-cols-3 gap-8 container mx-auto">
				<div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
					<div className="p-4 rounded-full bg-primary/10 text-primary">
						<PenTool size={32} />
					</div>
					<h3 className="text-xl font-bold">Express Yourself</h3>
					<p className="text-muted-foreground">
						Share your poetry, thoughts, and daily musings with a community that
						appreciates depth.
					</p>
				</div>
				<div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
					<div className="p-4 rounded-full bg-primary/10 text-primary">
						<ImageIcon size={32} />
					</div>
					<h3 className="text-xl font-bold">Visual Stories</h3>
					<p className="text-muted-foreground">
						Enhance your words with images. Capture moments and share the world
						through your lens.
					</p>
				</div>
				<div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
					<div className="p-4 rounded-full bg-primary/10 text-primary">
						<Heart size={32} />
					</div>
					<h3 className="text-xl font-bold">Feel the Love</h3>
					<p className="text-muted-foreground">
						Engage with content using a range of expressive reactions. Connect
						beyond just a 'like'.
					</p>
				</div>
			</section>

			{/* Footer */}
			<footer className="mt-auto py-8 border-t text-center text-muted-foreground">
				<p>
					&copy; {new Date().getFullYear()} {config.BRAND_NAME}. All rights
					reserved.
				</p>
			</footer>
		</div>
	);
}
