import { useGetUploadSignature } from "@/api/media.api";
import { getProfileInfo } from "@/api/user.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadFileToCloudinary } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Camera } from "lucide-react";

export const Route = createFileRoute("/_auth/profile")({
    component: ProfilePage,
    beforeLoad: async ({ context }) => {
        const { queryClient } = context;
        await queryClient.ensureQueryData(getProfileInfo());
    },
});

function ProfilePage() {
    const { data: user, isError } = useQuery(getProfileInfo());
    const getUploadSignature = useGetUploadSignature();

    if (isError) {
        return <div>Error loading profile</div>;
    }

    async function handleProfilePictureChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];
        if (!file) return;
        const data = await getUploadSignature.mutateAsync();
        if (!data) return;
        const uploadData = await uploadFileToCloudinary(
            file,
            data as { timestamp: number; signature: string }
        );
    }

    return (
        <div className="space-y-4">
            <section
                className={`flex items-center gap-4 rounded-lg border bg-gradient-to-bl from-indigo-200 to-lime-200 p-4 shadow-md`}
                style={{
                    backgroundImage: user?.coverPicture
                        ? `url(${user.coverPicture})`
                        : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="relative">
                    <Avatar className="h-20 w-20">
                        <AvatarImage
                            src={user?.profilePicture as string}
                            alt={user?.username}
                        />
                        <AvatarFallback>
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div
                        className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-white p-1 shadow-md transition-colors hover:bg-gray-100"
                        onClick={() => {
                            document.getElementById("profile-picture")?.click();
                        }}
                    >
                        <input
                            id="profile-picture"
                            type="file"
                            className="hidden"
                            onChange={handleProfilePictureChange}
                            accept="image/*"
                        />
                        <Camera />
                    </div>
                </div>
                <div>
                    <h1>{user?.username}</h1>
                    <h5>
                        Joined:{" "}
                        {format(
                            new Date(user?.createdAt as string),
                            "MMMM dd, yyyy"
                        )}
                    </h5>
                </div>
            </section>

            <section></section>
        </div>
    );
}
