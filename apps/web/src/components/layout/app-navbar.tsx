import { Button } from "@default-full-app/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@default-full-app/ui/components/dropdown-menu";
import { Input } from "@default-full-app/ui/components/input";
import { Separator } from "@default-full-app/ui/components/separator";
import { SidebarTrigger } from "@default-full-app/ui/components/sidebar";
import { useNavigate } from "@tanstack/react-router";
import { BellIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { ModeToggle } from "@/components/mode-toggle";
import { UserAvatar } from "@/components/shared/user-avatar";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

type AppNavbarProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
};

export function AppNavbar({ user }: AppNavbarProps) {
  const navigate = useNavigate();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await queryClient.clear();
          await navigate({ to: "/login" });
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Não foi possível sair");
        },
      },
    });
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/70 transition-[height,padding] duration-200">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <div className="relative hidden min-w-0 flex-1 md:block md:max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Pesquisar…"
          className="pl-8"
          aria-label="Pesquisar"
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notificações"
          onClick={() => toast.message("Nenhuma notificação no momento")}
        >
          <BellIcon />
        </Button>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-9 gap-2 px-2" />
            }
          >
            <UserAvatar name={user.name} image={user.image} />
            <span className="hidden max-w-[10rem] flex-col items-start text-left sm:flex">
              <span className="truncate font-medium text-xs">{user.name}</span>
              <span className="truncate text-[11px] text-muted-foreground">{user.email}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{user.name}</span>
                  <span className="text-muted-foreground text-xs">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => void handleSignOut()}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
