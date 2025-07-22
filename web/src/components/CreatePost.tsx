import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createPostSchema, type CreatePostSchemaType } from "shared";
import { Form, FormField, FormItem } from "./ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function CreatePost() {
    const form = useForm<CreatePostSchemaType>({
        resolver: zodResolver(createPostSchema),
    });
    return (
        <Form {...form}>
            <form className="flex flex-col gap-2">
                <FormField
                    name="content"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <Textarea
                                {...field}
                                placeholder="What's on your mind?"
                            />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="ml-auto">
                    Post
                </Button>
            </form>
        </Form>
    );
}

export default CreatePost;
