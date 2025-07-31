import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchemaType } from "shared";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/api/auth.api";
import { Loader } from "lucide-react";

export const Route = createFileRoute("/login")({
    component: LoginPage,
});

function LoginPage() {
    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const login = useLogin();

    const navigate = useNavigate();

    return (
        <div className="mx-auto mt-12 max-w-md p-4">
            <Form {...form}>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={form.handleSubmit(data => {
                        login.mutate(data, {
                            onSuccess() {
                                navigate({
                                    to: "/feed",
                                });
                            },
                        });
                    })}
                >
                    <h1>Login</h1>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Email" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        {...field}
                                        placeholder="Password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={login.isPending}>
                        {login.isPending ? (
                            <>
                                <Loader className="animate-spin" /> Logging
                                in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
