import {
    createRootRoute,
    Link,
    Outlet,
    useNavigate,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai/react";
import { authAtom } from "@/lib/store";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 2, // 2 minutes
            refetchOnWindowFocus: false,
        },
    },
});

export const Route = createRootRoute({
    component: RootLayout,
});

function RootLayout() {
    const [auth, setAuth] = useAtom(authAtom);
    const navigate = useNavigate();

    function handleLogout() {
        setAuth(null);
        navigate({
            to: "/login",
            reloadDocument: true,
        });
    }

    return (
        <QueryClientProvider client={queryClient}>
            <header className="bg-accent flex w-full items-center justify-between gap-2 px-4 py-2">
                <Link
                    to={auth ? "/feed" : "/"}
                    className="[&.active]:font-bold"
                >
                    Home
                </Link>
                {auth ? (
                    <nav>
                        <Button variant={"destructive"} onClick={handleLogout}>
                            Logout
                        </Button>
                    </nav>
                ) : (
                    <nav className="flex items-center gap-2">
                        <Link to="/login" className="[&.active]:font-bold">
                            <Button variant="outline">Login</Button>
                        </Link>
                        <Link to="/register" className="[&.active]:font-bold">
                            <Button variant="outline">Register</Button>
                        </Link>
                    </nav>
                )}
            </header>
            <hr />
            <Outlet />
            <Toaster />
        </QueryClientProvider>
    );
}
