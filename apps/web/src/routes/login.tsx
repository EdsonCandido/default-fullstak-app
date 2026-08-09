import { createFileRoute, redirect } from "@tanstack/react-router";

import { LoginForm } from "@/features/auth/login-form";
import { LoadingState } from "@/components/shared/loading-state";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: LoginPage,
  pendingComponent: () => <LoadingState className="min-h-svh" />,
});

function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--muted)_0%,_var(--background)_55%)] p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
