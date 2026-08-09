import { SidebarInset, SidebarProvider } from "@default-full-app/ui/components/sidebar";
import { Outlet } from "@tanstack/react-router";

import { AppNavbar } from "@/components/layout/app-navbar";
import { AppSidebar } from "@/components/layout/app-sidebar";

type AppShellProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
};

function getSidebarDefaultOpen() {
  if (typeof document === "undefined") {
    return true;
  }
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("sidebar_state="));
  if (!match) {
    return true;
  }
  return match.split("=")[1] === "true";
}

export function AppShell({ user }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={getSidebarDefaultOpen()}>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppNavbar user={user} />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
