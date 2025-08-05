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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { getDefaultStore } from "jotai/vanilla";

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
    context: () => {
        const store = getDefaultStore();
        const auth = store.get(authAtom);
        return {
            queryClient,
            auth,
        };
    },
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
                    <img src="/logo.png" alt="Logo" className="h-16" />
                </Link>
                {auth ? (
                    <nav className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="rounded-full border bg-white">
                                <Avatar>
                                    <AvatarImage
                                        src={auth?.user?.profile_picture}
                                    />
                                    <AvatarFallback>
                                        {auth?.user?.username.slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <Link
                                        to={`/profile`}
                                        className="flex items-center gap-2"
                                    >
                                        <User /> Profile
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
            <Toaster richColors />
        </QueryClientProvider>
    );
}
