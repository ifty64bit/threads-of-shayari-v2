import type { APIType } from "@api";
import { hc } from "hono/client";

export const api = hc<APIType>("/");
