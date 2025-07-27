import { getPosts } from "@/api/post.api";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard/PostCard";
import PostCardLoader from "@/components/PostCard/PostCardLoader";
import {
    useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_auth/feed")({
    component: FeedRoute,
    pendingComponent: () => (
        <div className="space-y-4">
            <PostCardLoader />
            <PostCardLoader />
            <PostCardLoader />
        </div>
    ),
});

function FeedRoute() {
    return (
        <div>
            <section>
                <CreatePost />
            </section>
            <section>
                <h2 className="text-lg font-semibold">Posts</h2>
                <hr className="my-2" />
                <Suspense
                    fallback={Array.from({ length: 3 }, (_, i) => (
                        <PostCardLoader key={i} />
                    ))}
                >
                    <DisplayPosts />
                </Suspense>
            </section>
        </div>
    );
}

function DisplayPosts() {
    const { data } = useSuspenseInfiniteQuery(getPosts());

    const posts = data?.pages.flatMap(page => page.data) || [];

    return (
        <div className="space-y-4">
            {posts.length === 0 && (
                <p>No posts available. Be the first to create one!</p>
            )}
            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}
