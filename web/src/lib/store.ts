import { atomWithStorage } from "jotai/utils";

type AuthType = {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
        profile_picture?: string;
    };
};

export const authAtom = atomWithStorage<AuthType | null>(
    "auth",
    null,
    undefined,
    {
        getOnInit: true,
    }
);
