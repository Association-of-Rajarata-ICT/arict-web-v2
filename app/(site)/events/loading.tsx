import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading events">
      <div className="border-b border-line bg-mist pt-36 pb-16">
        <div className="container-page space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>
      </div>
      <div className="container-page grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-line">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
