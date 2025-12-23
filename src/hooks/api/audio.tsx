import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	addNewAudioPreset,
	getAudioPresetsforAdmin,
	getAudioPresetsforUsers,
} from "@/functions/audio";
import { uploadToCDN } from "@/lib/cloudinary";
import type { NewAudioPresetSchema } from "@/lib/schemas/audio";

export function useUplaodAudioPreset() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ data }: { data: NewAudioPresetSchema }) => {
			const { audio, ...rest } = data;
			if (audio instanceof File) {
				const publicId = await uploadToCDN([audio], { type: "audio" });
				await addNewAudioPreset({ data: { ...rest, audio: publicId[0] } });
			}
		},
		onMutate: () => {
			const toastId = toast.loading("Uploading Audio Preset");
			return {
				toastId,
			};
		},
		onSuccess: (_, __, ctx) => {
			toast.success("Audio Preset Uploaded Successfully", {
				id: ctx.toastId,
			});
			queryClient.invalidateQueries({
				queryKey: ["audio-presets-admin"],
			});
		},
		onError: (_, __, ctx) => {
			toast.error("Failed to Upload Audio Preset", {
				id: ctx?.toastId,
			});
		},
	});
}

export function getAudioPresetsForUsersOptions({
	search,
}: {
	search?: string;
}) {
	return queryOptions({
		queryKey: ["audio-presets", { search }],
		queryFn: () => getAudioPresetsforUsers({ data: { search } }),
	});
}

export function getAudioPresetsForAdminOptions({
	search,
	limit,
	offset,
}: {
	search?: string;
	limit?: number;
	offset?: number;
}) {
	return queryOptions({
		queryKey: ["audio-presets-admin", { search, limit, offset }],
		queryFn: () => getAudioPresetsforAdmin({ data: { search, limit, offset } }),
	});
}
