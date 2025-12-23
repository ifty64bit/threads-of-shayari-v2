import { createFileRoute } from "@tanstack/react-router";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import NewAudioPreset from "./-components/NewAudioPreset";

export const Route = createFileRoute("/_admin/audio-presets/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1>Audio Presets</h1>
				<NewAudioPreset>Add New Preset</NewAudioPreset>
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
					<TableRow>
						<TableCell className="font-medium text-center">1</TableCell>
						<TableCell className="text-center">Default</TableCell>
						<TableCell className="text-center">Default</TableCell>
						<TableCell className="text-center">Default</TableCell>
						<TableCell className="text-center">Default</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	);
}
