import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@default-full-app/ui/components/card";
import { Skeleton } from "@default-full-app/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@default-full-app/ui/components/table";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ActivityIcon, ClockIcon, ServerIcon, UsersIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatsCard, StatsCardSkeleton } from "@/components/shared/stats-card";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function DashboardPage() {
  const statsQuery = useQuery(trpc.dashboard.stats.queryOptions());
  const sessionsQuery = useQuery(trpc.dashboard.recentSessions.queryOptions());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do ambiente administrativo"
        breadcrumbs={[
          { label: "Início", to: "/dashboard" },
          { label: "Dashboard" },
        ]}
      />

      {statsQuery.isError ? (
        <ErrorState
          description={statsQuery.error.message}
          onRetry={() => void statsQuery.refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsQuery.isLoading || !statsQuery.data ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Usuários"
                value={String(statsQuery.data.usersCount)}
                description="Contas ativas no sistema"
                icon={UsersIcon}
              />
              <StatsCard
                title="Sessão ativa"
                value={formatDate(statsQuery.data.activeSession.createdAt)}
                description={`Expira em ${formatDate(statsQuery.data.activeSession.expiresAt)}`}
                icon={ActivityIcon}
              />
              <StatsCard
                title="Último login"
                value={formatDate(statsQuery.data.lastLoginAt)}
                description="Registro mais recente da sua conta"
                icon={ClockIcon}
              />
              <StatsCard
                title="Ambiente"
                value={statsQuery.data.environment}
                description="NODE_ENV do servidor"
                icon={ServerIcon}
              />
            </>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Últimos acessos</CardTitle>
          <CardDescription>Sessões recentes registradas no banco</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsQuery.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : sessionsQuery.isError ? (
            <ErrorState
              description={sessionsQuery.error.message}
              onRetry={() => void sessionsQuery.refetch()}
            />
          ) : !sessionsQuery.data || sessionsQuery.data.length === 0 ? (
            <EmptyState
              title="Nenhum acesso registrado"
              description="Assim que houver sessões, elas aparecerão aqui."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="hidden md:table-cell">User-Agent</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsQuery.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{row.userName}</span>
                        <span className="text-muted-foreground text-xs">{row.userEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>{row.ipAddress || "—"}</TableCell>
                    <TableCell className="hidden max-w-[20rem] truncate md:table-cell">
                      {row.userAgent || "—"}
                    </TableCell>
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
