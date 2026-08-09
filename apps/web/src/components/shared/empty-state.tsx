import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@default-full-app/ui/components/empty";
import { cn } from "@default-full-app/ui/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <Empty className={cn("border border-border/60", className)}>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
    </Empty>
  );
}
