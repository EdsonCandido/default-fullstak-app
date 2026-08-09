import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@default-full-app/ui/components/card";
import { Skeleton } from "@default-full-app/ui/components/skeleton";
import { cn } from "@default-full-app/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatsCard({ title, value, description, icon: Icon, className }: StatsCardProps) {
  return (
    <Card className={cn("transition-shadow duration-200 hover:shadow-sm", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl font-semibold tracking-tight">{value}</CardTitle>
        </div>
        {Icon ? (
          <div className="rounded-md bg-muted p-2 text-muted-foreground">
            <Icon aria-hidden />
          </div>
        ) : null}
      </CardHeader>
      {description ? (
        <CardContent>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-28" />
        </div>
        <Skeleton className="size-9 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-36" />
      </CardContent>
    </Card>
  );
}
