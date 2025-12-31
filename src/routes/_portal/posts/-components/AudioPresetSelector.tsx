import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce, useIntersectionObserver } from "@uidotdev/usehooks";
import {
	CheckIcon,
	LoaderIcon,
	Music,
	PauseIcon,
	PlayIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { getAudioPresetsforUsers } from "@/data/functions/audio";
import { getInfiniteAudioPresetsForUsersOptions } from "@/hooks/api/audio";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

type AudioType = Awaited<
	ReturnType<typeof getAudioPresetsforUsers>
>["data"][number];
type AudioPresetSelectorProps = {
	value?: number;
	onChange: (value: AudioType) => void;
	children: React.ReactNode;
};
function AudioPresetSelector({
	value,
	onChange,
	children,
}: AudioPresetSelectorProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 500);
	const [playingId, setPlayingId] = useState<number | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [sentinelRef, sentinelEntry] = useIntersectionObserver({
		threshold: 0,
		root: null,
		rootMargin: "0px",
	});

	const {
		data: audios,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery(
		getInfiniteAudioPresetsForUsersOptions({
			search: debouncedSearch,
		}),
	);

	useEffect(() => {
		if (sentinelEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [
		sentinelEntry?.isIntersecting,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	]);

	const flatAudios = audios?.pages.flatMap((page) => page.data) ?? [];

	const handlePlayPause = (audioId: number, audioUrl: string) => {
		if (playingId === audioId) {
			audioRef.current?.pause();
			setPlayingId(null);
		} else {
			audioRef.current?.pause();
			const audio = new Audio(getCloudinaryUrl(audioUrl, { type: "audio" }));
			audio.onended = () => setPlayingId(null);
			audioRef.current = audio;
			audio.play();
			setPlayingId(audioId);
		}
	};

	return (
		<div>
			<Popover
				open={open}
				onOpenChange={(isOpen) => {
					setOpen(isOpen);
					if (!isOpen) {
						audioRef.current?.pause();
						setPlayingId(null);
					}
				}}
			>
				<PopoverTrigger asChild>
					<Button variant="ghost" size="sm" role="combobox" className="">
						{value ? (
							<>
								<Music className="h-4 w-4" />
								{flatAudios.find((audio) => audio.id === value)?.displayName}
							</>
						) : (
							children
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[250px] p-0">
					<Command>
						<CommandInput
							placeholder="Search audio preset..."
							value={search}
							onValueChange={(value) => setSearch(value)}
						/>
						<CommandList>
							<CommandEmpty>No Audio Preset found.</CommandEmpty>
							<CommandGroup>
								{flatAudios.map((audio) => (
									<CommandItem
										key={audio.id}
										value={audio.displayName}
										onSelect={() => {
											onChange(audio);
											setOpen(false);
										}}
										className="flex items-center justify-between"
									>
										<div className="flex items-center">
											<CheckIcon
												className={cn(
													"mr-2 h-4 w-4",
													value === audio.id ? "opacity-100" : "opacity-0",
												)}
											/>
											{audio.displayName}
										</div>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handlePlayPause(audio.id, audio.url);
											}}
											className="p-1 rounded-full hover:bg-muted"
										>
											{playingId === audio.id ? (
												<PauseIcon className="h-4 w-4" />
											) : (
												<PlayIcon className="h-4 w-4" />
											)}
										</button>
									</CommandItem>
								))}
								{/* Sentinel for infinite scroll */}
								<div ref={sentinelRef} className="h-1" />
								{isFetchingNextPage && (
									<div className="flex items-center justify-center py-2">
										<LoaderIcon className="h-4 w-4 animate-spin" />
									</div>
								)}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default AudioPresetSelector;
