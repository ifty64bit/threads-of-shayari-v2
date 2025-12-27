import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { CircleX, Pencil, SearchCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	closeDialog,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem, ThreeDotMenu } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	getUsersOptions,
	useAdminUpdateUser,
	useUpdateUserVerification,
} from "@/hooks/api/users";

export const Route = createFileRoute("/_admin/users/")({
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

type User = {
	id: number;
	name: string;
	username: string;
	email: string;
	emailVerified: boolean;
	isAdmin: boolean;
	createdAt: Date | null;
	updatedAt: Date | null;
};

const updateUserSchema = z.object({
	name: z.string().min(1, "Name is required"),
	username: z.string().min(1, "Username is required"),
	email: z.string().email("Invalid email address"),
	emailVerified: z.boolean(),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

function RouteComponent() {
	const { data: users } = useSuspenseQuery(
		getUsersOptions({
			limit: 10,
			offset: 0,
		}),
	);

	const updateVerification = useUpdateUserVerification();
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	return (
		<div className="p-4 text-center">
			<Table>
				<TableHeader>
					<TableRow className="text-center">
						<TableHead className="w-24 text-center">ID</TableHead>
						<TableHead className="text-center">Name</TableHead>
						<TableHead className="text-center">Username</TableHead>
						<TableHead className="text-center">Email</TableHead>
						<TableHead className="text-center">Approved</TableHead>
						<TableHead className="text-center">Joined</TableHead>
						<TableHead className="text-center">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell className="font-medium">
								<Link
									to={`/users/$userId`}
									params={{ userId: user.id.toString() }}
								>
									{user.id}
								</Link>
							</TableCell>
							<TableCell>
								<Link
									to={`/users/$userId`}
									params={{ userId: user.id.toString() }}
								>
									{user.name}
								</Link>
							</TableCell>
							<TableCell>
								<Link
									to={`/users/$userId`}
									params={{ userId: user.id.toString() }}
								>
									{user.username}
								</Link>
							</TableCell>
							<TableCell>
								<Link
									to={`/users/$userId`}
									params={{ userId: user.id.toString() }}
								>
									{user.email}
								</Link>
							</TableCell>
							<TableCell>{user.emailVerified ? "Yes" : "No"}</TableCell>
							<TableCell>
								{dayjs(user.createdAt).format("D MMM YYYY h:mmA")}
							</TableCell>
							<TableCell>
								<ThreeDotMenu>
									<DropdownMenuItem onClick={() => setSelectedUser(user)}>
										<Pencil /> Edit
									</DropdownMenuItem>
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

			<UpdateUserModal
				user={selectedUser}
				open={!!selectedUser}
				onOpenChange={(open) => !open && setSelectedUser(null)}
			/>
		</div>
	);
}

function UpdateUserModal({
	user,
	open,
	onOpenChange,
}: {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const updateUser = useAdminUpdateUser();

	const form = useForm<UpdateUserFormValues>({
		resolver: zodResolver(updateUserSchema),
		values: {
			name: user?.name ?? "",
			username: user?.username ?? "",
			email: user?.email ?? "",
			emailVerified: user?.emailVerified ?? false,
		},
	});

	function handleSubmit(values: UpdateUserFormValues) {
		if (!user) return;

		updateUser.mutate(
			{
				data: {
					userId: user.id,
					name: values.name,
					username: values.username,
					email: values.email,
					emailVerified: values.emailVerified,
				},
			},
			{
				onSuccess: () => {
					onOpenChange(false);
					closeDialog();
				},
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update User</DialogTitle>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							placeholder="Enter name"
							{...form.register("name")}
						/>
						{form.formState.errors.name && (
							<p className="text-sm text-destructive">
								{form.formState.errors.name.message}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							placeholder="Enter username"
							{...form.register("username")}
						/>
						{form.formState.errors.username && (
							<p className="text-sm text-destructive">
								{form.formState.errors.username.message}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="Enter email"
							{...form.register("email")}
						/>
						{form.formState.errors.email && (
							<p className="text-sm text-destructive">
								{form.formState.errors.email.message}
							</p>
						)}
					</div>
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="emailVerified"
							className="h-4 w-4 rounded border-gray-300"
							{...form.register("emailVerified")}
						/>
						<Label htmlFor="emailVerified">Approved</Label>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" isLoading={updateUser.isPending}>
							Save Changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
