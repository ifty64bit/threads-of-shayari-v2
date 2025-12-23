import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Music, X } from "lucide-react";
import { useMemo } from "react";
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
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUplaodAudioPreset } from "@/hooks/api/audio";

export const newAudioPresetSchema = z.object({
	displayName: z.string().min(3, "Display name must be at least 3 characters"),
	audio: z.union([z.string().min(3), z.instanceof(File)], {
		required_error: "Please select an audio file",
	}),
	isPublic: z.boolean(),
});

export type NewAudioPresetSchema = z.infer<typeof newAudioPresetSchema>;

function NewAudioPreset({ children }: { children: React.ReactNode }) {
	const uploadAudio = useUplaodAudioPreset();

	const form = useForm<NewAudioPresetSchema>({
		resolver: zodResolver(newAudioPresetSchema),
		defaultValues: {
			isPublic: false,
			displayName: "",
			audio: undefined,
		},
	});

	const audioFile = form.watch("audio");
	const audioPreviewUrl = useMemo(() => {
		if (audioFile instanceof File) {
			return URL.createObjectURL(audioFile);
		}
		return null;
	}, [audioFile]);

	async function handleSubmit(values: NewAudioPresetSchema) {
		uploadAudio.mutate(
			{
				data: values,
			},
			{
				onSuccess: () => {
					form.reset();
					closeDialog();
				},
			},
		);
	}

	function handleRemoveAudio() {
		form.setValue("audio", undefined as unknown as File);
	}

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New Audio Preset</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						className="space-y-4"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<FormField
							control={form.control}
							name="displayName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Display Name</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter a name for this preset"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="audio"
							render={({ field: { value, onChange, ...fieldProps } }) => (
								<FormItem>
									<FormLabel htmlFor="audio">Audio File</FormLabel>
									{audioFile instanceof File ? (
										<div className="space-y-2">
											<div className="flex items-center gap-2 p-2 bg-muted rounded-md">
												<Music className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm flex-1 truncate">
													{audioFile.name}
												</span>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={handleRemoveAudio}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
											{audioPreviewUrl && (
												<audio
													controls
													src={audioPreviewUrl}
													className="w-full h-10"
												>
													<track kind="captions" />
												</audio>
											)}
										</div>
									) : (
										<FormControl>
											<Input
												id="audio"
												type="file"
												accept="audio/*"
												{...fieldProps}
												onChange={(e) => onChange(e.target.files?.[0])}
											/>
										</FormControl>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isPublic"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center gap-2">
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<FormLabel className="mt-0! cursor-pointer">
										Make this preset public
									</FormLabel>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="submit" disabled={uploadAudio.isPending}>
								{uploadAudio.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								{uploadAudio.isPending ? "Uploading..." : "Save Preset"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default NewAudioPreset;
