import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

function NewAudioPreset({ children }: { children: React.ReactNode }) {
	return (
		<Dialog>
			<DialogTrigger>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New Audio Preset</DialogTitle>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

export default NewAudioPreset;
