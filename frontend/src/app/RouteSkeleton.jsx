import { Skeleton } from '../components/ui/Skeleton';

export function RouteSkeleton() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full animate-fadeIn">
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-[10px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-[14px]" />
        <Skeleton className="h-24 rounded-[14px]" />
        <Skeleton className="h-24 rounded-[14px]" />
        <Skeleton className="h-24 rounded-[14px]" />
      </div>

      <Skeleton className="h-80 w-full rounded-[14px]" />
    </div>
  );
}
