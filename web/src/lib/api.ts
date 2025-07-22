import type { APIType } from "api";
import { hc } from "hono/client";
import { createStore } from "jotai/vanilla";
import { authAtom } from "./store";

const store = createStore();

function getAuthToken() {
    return store.get(authAtom)?.token;
}

export const api = hc<APIType>("/", {
    headers: {
        Authorization: `Bearer ${getAuthToken()}`,
    },
});
