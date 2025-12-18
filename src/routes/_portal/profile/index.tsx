import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCurrentUserOptions } from "@/hooks/api/users";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export const Route = createFileRoute("/_portal/profile/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(getCurrentUserOptions);
	},
});

function RouteComponent() {
	const { data: user } = useSuspenseQuery(getCurrentUserOptions);

	return (
		<>
			<section className="flex flex-col justify-center items-center mt-4">
				<img
					src={getCloudinaryUrl(user?.image)}
					alt={user?.name}
					width={100}
					height={100}
					className="rounded-full"
				/>
				<h5>{user?.name}</h5>
				<p className="text-sm">@{user?.username}</p>
			</section>
			<section></section>
		</>
	);
}
