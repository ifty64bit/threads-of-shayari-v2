import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterSchemaType } from "shared";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import { useRegister } from "@/api/auth.api";
import { Loader } from "lucide-react";

const extendedSchema = registerSchema
    .extend({
        confirmPassword: z.string().min(6, "Confirm Password is required"),
    })
    .check(ctx => {
        if (ctx.value.password !== ctx.value.confirmPassword) {
            ctx.issues.push({
                code: "custom",
                message: "Passwords do not match",
                input: ctx.value.confirmPassword,
            });
        }
    });

export const Route = createFileRoute("/register")({
    component: RouteComponent,
});

function RouteComponent() {
    const form = useForm<RegisterSchemaType & { confirmPassword: string }>({
        resolver: zodResolver(extendedSchema),
    });

    const register = useRegister();

    const navigate = useNavigate();

    return (
        <div className="mx-auto mt-12 max-w-md p-4">
            <Form {...form}>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={form.handleSubmit(data => {
                        register.mutate(data, {
                            onSuccess() {
                                navigate({
                                    to: "/login",
                                });
                            },
                        });
                    })}
                >
                    <h1>Register</h1>

                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Username" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        {...field}
                                        placeholder="Confirm Password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={register.isPending}>
                        {register.isPending ? (
                            <>
                                <Loader className="animate-spin" />{" "}
                                Registering...
                            </>
                        ) : (
                            "Register"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
