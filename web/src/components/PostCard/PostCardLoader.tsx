import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function PostCardLoader() {
    return (
        <Card className="mb-4">
            <CardHeader className="flex items-center gap-4 border-b shadow-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <CardTitle>
                    <Skeleton className="mb-2 h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                </CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap">
                <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter className="flex justify-between gap-4 border-t">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-full" />
            </CardFooter>
        </Card>
    );
}

export default PostCardLoader;
