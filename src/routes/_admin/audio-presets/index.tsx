import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getAudioPresetsForAdminOptions } from "@/hooks/api/audio";
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
	const [limit, setLimit] = useState(10);
	const [offset, setOffset] = useState(0);
	const [search, setSearch] = useState("");

	const { data: presets } = useSuspenseQuery(
		getAudioPresetsForAdminOptions({
			limit,
			offset,
			search,
		}),
	);

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
								<audio controls>
									<source
										src={
											getCloudinaryUrl(preset.url, { type: "audio" }) ??
											undefined
										}
									/>
								</audio>
							</TableCell>
							<TableCell className="text-center">
								{dayjs(preset.createdAt).format("D MMM YYYY h:mmA")}
							</TableCell>
							<TableCell className="text-center">Default</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
