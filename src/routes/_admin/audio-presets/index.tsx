import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	getAudioPresetsForAdminOptions,
	useUpdateAudioPreset,
} from "@/hooks/api/audio";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import NewAudioPreset from "./-components/NewAudioPreset";

export const Route = createFileRoute("/_admin/audio-presets/")({
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
		await context.queryClient.ensureQueryData(
			getAudioPresetsForAdminOptions(deps),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { limit, offset, search } = Route.useSearch();
	const navigate = Route.useNavigate();

	const { data } = useSuspenseQuery(
		getAudioPresetsForAdminOptions({
			limit,
			offset,
			search,
		}),
	);

	const updateAudioPreset = useUpdateAudioPreset();

	const { presets, total } = data;
	const currentPage = Math.floor(offset / limit) + 1;
	const totalPages = Math.ceil(total / limit);

	const goToPage = (page: number) => {
		navigate({
			search: {
				limit,
				offset: (page - 1) * limit,
				search,
			},
		});
	};

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
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1>Audio Presets</h1>
				<NewAudioPreset>
					<Button>Add New Preset</Button>
				</NewAudioPreset>
			</div>
			<Table>
				<TableHeader>
					<TableRow className="text-center">
						<TableHead className="w-24 text-center">ID</TableHead>
						<TableHead className="text-center">Display Name</TableHead>
						<TableHead className="text-center">Audio</TableHead>
						<TableHead className="text-center">Is Public</TableHead>
						<TableHead className="text-center">Uploaded At</TableHead>
						<TableHead className="text-center">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{presets.map((preset) => (
						<TableRow key={preset.id}>
							<TableCell className="font-medium text-center">
								{preset.id}
							</TableCell>
							<TableCell className="text-center">
								{preset.displayName}
							</TableCell>
							<TableCell className="text-center">
								<ClientOnly>
									<audio controls>
										<source
											src={
												getCloudinaryUrl(preset.url, { type: "audio" }) ??
												undefined
											}
										/>
									</audio>
								</ClientOnly>
							</TableCell>
							<TableCell className="text-center">
								<Switch
									checked={preset.isPublic}
									onCheckedChange={(checked) => {
										updateAudioPreset.mutate({
											id: preset.id,
											data: {
												isPublic: checked,
											},
											limit,
											offset,
											search,
										});
									}}
								/>
							</TableCell>
							<TableCell className="text-center">
								{dayjs(preset.createdAt).format("D MMM YYYY h:mmA")}
							</TableCell>
							<TableCell className="text-center">Default</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

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
	);
}
