import { Spinner } from "@default-full-app/ui/components/spinner";
import { cn } from "@default-full-app/ui/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = "Carregando…", className }: LoadingStateProps) {
  return (
    <div
      className={cn("flex min-h-40 flex-col items-center justify-center gap-3 text-muted-foreground", className)}
      role="status"
      aria-live="polite"
    >
      <Spinner />
      <p className="text-sm">{label}</p>
    </div>
  );
}
