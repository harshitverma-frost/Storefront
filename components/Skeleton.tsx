export function SkeletonCard() {
    return (
        <div className="overflow-hidden rounded-xl border border-light-border bg-white">
            <div className="aspect-square animate-shimmer" />
            <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded animate-shimmer" />
                <div className="h-3 w-1/2 rounded animate-shimmer" />
                <div className="h-5 w-1/3 rounded animate-shimmer" />
                <div className="h-10 w-full rounded-lg animate-shimmer" />
            </div>
        </div>
    );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
    return <div className={`rounded animate-shimmer ${className}`} />;
}

export function SkeletonProductGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function SkeletonHero() {
    return (
        <div className="h-[500px] animate-shimmer" />
    );
}
