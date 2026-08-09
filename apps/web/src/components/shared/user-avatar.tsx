import { Avatar, AvatarFallback, AvatarImage } from "@default-full-app/ui/components/avatar";
import { cn } from "@default-full-app/ui/lib/utils";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

type UserAvatarProps = {
  name: string;
  image?: string | null;
  className?: string;
};

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("size-8", className)}>
      {image ? <AvatarImage src={image} alt={name} /> : null}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
