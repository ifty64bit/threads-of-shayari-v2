import {
	infiniteQueryOptions,
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	addNewAudioPreset,
	getAudioPresetsforAdmin,
	getAudioPresetsforUsers,
	updateAudioPreset,
} from "@/data/functions/audio";
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

export function getInfiniteAudioPresetsForUsersOptions({
	search,
}: {
	search?: string;
}) {
	return infiniteQueryOptions({
		queryKey: ["audio-presets", { search }],
		queryFn: ({ pageParam }) =>
			getAudioPresetsforUsers({
				data: { search, cursor: pageParam ?? undefined },
			}),
		initialPageParam: null as number | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
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

export function useUpdateAudioPreset() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: { displayName?: string; isPublic?: boolean };
			limit?: number;
			offset?: number;
			search?: string;
		}) => {
			return await updateAudioPreset({ data: { id, data } });
		},
		onMutate: () => {
			const toastId = toast.loading("Updating Audio Preset");
			return {
				toastId,
			};
		},
		onSuccess: (data, variables, ctx) => {
			toast.success("Audio Preset Updated Successfully", {
				id: ctx.toastId,
			});
			queryClient.setQueryData(
				getAudioPresetsForAdminOptions({
					search: variables.search,
					limit: variables.limit,
					offset: variables.offset,
				}).queryKey,
				(oldData) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						presets: oldData.presets.map((preset) =>
							preset.id === variables.id ? { ...preset, ...data } : preset,
						),
					};
				},
			);
		},
		onError: (_, __, ctx) => {
			toast.error("Failed to Update Audio Preset", {
				id: ctx?.toastId,
			});
		},
	});
}
