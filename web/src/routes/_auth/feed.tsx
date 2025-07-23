import { getPosts } from '@/api/post.api';
import CreatePost from '@/components/CreatePost';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/feed')({
    component: FeedRoute,
});

function FeedRoute() {
    const { data } = useInfiniteQuery(getPosts());

    const posts = data?.pages.flatMap(page => page.data) || [];

    return (
        <div>
            <section>
                <CreatePost />
            </section>
            <section>
                <h2 className="text-lg font-semibold">Posts</h2>
                <hr className="my-2" />

                <div>
                    {posts.length === 0 && (
                        <p>No posts available. Be the first to create one!</p>
                    )}
                    {posts.map(post => (
                        <Card key={post.id}>
                            <CardHeader className="flex gap-4 border-b shadow-lg">
                                <Avatar>
                                    <AvatarImage
                                        src={post.author_avatar as string}
                                    />
                                    <AvatarFallback>
                                        {post.author_name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle>
                                    <h3>{post.author_name}</h3>
                                    <h5 className="text-muted-foreground text-sm">
                                        @{post.author_username}
                                    </h5>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="whitespace-pre-wrap">
                                {post.content}
                            </CardContent>
                            <CardFooter>
                                <p className="text-muted-foreground text-xs">
                                    Posted on{' '}
                                    {new Date(post.createdAt).toLocaleString()}
                                </p>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
