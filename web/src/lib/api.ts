import type { APIType } from "api";
import { hc } from "hono/client";
import { getDefaultStore } from "jotai/vanilla";
import { authAtom } from "./store";

const store = getDefaultStore();

const api = hc<APIType>("/", {
    headers: () => {
        const auth = store.get(authAtom);
        const headers: Record<string, string> = {};
        if (auth?.token) {
            headers.Authorization = `Bearer ${auth.token}`;
        }
        return headers;
    },
    async fetch(input, requestInit, _Env, _executionCtx) {
        const res = await fetch(input, requestInit);
        if (res.status === 401) {
            console.log("Unauthorized request, clearing auth atom", res.status);
            store.set(authAtom, null);
        }
        return res;
    },
});

export default api.api;
