import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { CircleX, SearchCheck } from "lucide-react";
import z from "zod";
import { DropdownMenuItem, ThreeDotMenu } from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getUsersOptions, useUpdateUserVerification } from "@/hooks/api/users";

export const Route = createFileRoute("/_admin/users")({
	component: RouteComponent,
	validateSearch: z.object({
		offset: z.number().optional().default(0),
		limit: z.number().optional().default(10),
	}),
	loaderDeps: ({ search: { offset, limit } }) => ({
		offset,
		limit,
	}),
	loader: async ({ deps, context }) => {
		await context.queryClient.ensureQueryData(
			getUsersOptions({
				limit: deps.limit,
				offset: deps.offset,
			}),
		);
	},
});

function RouteComponent() {
	const { data: users } = useSuspenseQuery(
		getUsersOptions({
			limit: 10,
			offset: 0,
		}),
	);

	const updateVerification = useUpdateUserVerification();

	return (
		<div className="p-4 text-center">
			<Table>
				<TableHeader>
					<TableRow className="text-center">
						<TableHead className="w-[100px] text-center">ID</TableHead>
						<TableHead className="text-center">Name</TableHead>
						<TableHead className="text-center">Username</TableHead>
						<TableHead className="text-center">Email</TableHead>
						<TableHead className="text-center">Verified</TableHead>
						<TableHead className="text-center">Joined</TableHead>
						<TableHead className="text-center">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell className="font-medium">{user.id}</TableCell>
							<TableCell>{user.name}</TableCell>
							<TableCell>{user.username}</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>{user.emailVerified ? "Yes" : "No"}</TableCell>
							<TableCell>
								{dayjs(user.createdAt).format("D MMM YYYY h:mmA")}
							</TableCell>
							<TableCell>
								<ThreeDotMenu>
									{user.emailVerified ? (
										<DropdownMenuItem
											variant="destructive"
											onClick={() =>
												updateVerification.mutate({
													data: {
														userId: user.id.toString(),
														verified: false,
													},
												})
											}
										>
											<CircleX /> Deny
										</DropdownMenuItem>
									) : (
										<DropdownMenuItem
											onClick={() =>
												updateVerification.mutate({
													data: {
														userId: user.id.toString(),
														verified: true,
													},
												})
											}
										>
											<SearchCheck /> Approve
										</DropdownMenuItem>
									)}
								</ThreeDotMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
