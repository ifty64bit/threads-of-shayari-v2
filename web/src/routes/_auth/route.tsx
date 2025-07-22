import { authAtom } from "@/lib/store";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAtom } from "jotai/react";

export const Route = createFileRoute("/_auth")({
    component: RouteComponent,
});

function RouteComponent() {
    const [auth] = useAtom(authAtom);
    
    if (!auth) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
