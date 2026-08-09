import { Badge } from "@default-full-app/ui/components/badge";
import { Button } from "@default-full-app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@default-full-app/ui/components/card";
import { Skeleton } from "@default-full-app/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@default-full-app/ui/components/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PencilIcon, PlusIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { SoftDeleteUserDialog } from "@/features/users/soft-delete-user-dialog";
import {
  UserFormDialog,
  type UserListItem,
} from "@/features/users/user-form-dialog";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_authenticated/users")({
  component: UsersPage,
});

type ListStatus = "active" | "deleted" | "all";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function UsersPage() {
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const currentUserId = session.data?.user?.id;

  const [status, setStatus] = useState<ListStatus>("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserListItem | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserListItem | null>(null);

  const usersQuery = useQuery(
    trpc.users.list.queryOptions({ status }),
  );

  const restoreMutation = useMutation(
    trpc.users.restore.mutationOptions({
      onSuccess: async () => {
        toast.success("Usuário restaurado");
        await queryClient.invalidateQueries(trpc.users.list.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const statusFilters: { value: ListStatus; label: string }[] = [
    { value: "active", label: "Ativos" },
    { value: "deleted", label: "Excluídos" },
    { value: "all", label: "Todos" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuários"
        description="Gerencie contas de acesso à plataforma"
        breadcrumbs={[
          { label: "Início", to: "/dashboard" },
          { label: "Usuários" },
        ]}
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Novo usuário
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Lista de usuários</CardTitle>
            <CardDescription>
              Soft-delete preserva os dados; contas podem ser restauradas
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={status === filter.value ? "default" : "outline"}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : usersQuery.isError ? (
            <ErrorState
              description={usersQuery.error.message}
              onRetry={() => void usersQuery.refetch()}
            />
          ) : !usersQuery.data || usersQuery.data.length === 0 ? (
            <EmptyState
              title="Nenhum usuário"
              description={
                status === "deleted"
                  ? "Não há usuários excluídos."
                  : "Crie o primeiro usuário ou use o seed do administrador."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="hidden md:table-cell">Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.data.map((user) => {
                  const isDeleted = Boolean(user.deletedAt);
                  const isSelf = user.id === currentUserId;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={user.name} image={user.image} />
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.jobTitle || "—"}
                      </TableCell>
                      <TableCell>
                        {isDeleted ? (
                          <Badge variant="destructive">Excluído</Badge>
                        ) : (
                          <Badge variant="secondary">Ativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isDeleted ? (
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="outline"
                              title="Restaurar"
                              disabled={restoreMutation.isPending}
                              onClick={() =>
                                restoreMutation.mutate({ id: user.id })
                              }
                            >
                              <RotateCcwIcon />
                              <span className="sr-only">Restaurar</span>
                            </Button>
                          ) : (
                            <>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="outline"
                                title="Editar"
                                onClick={() => setEditUser(user)}
                              >
                                <PencilIcon />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="destructive"
                                title={
                                  isSelf
                                    ? "Você não pode excluir a própria conta"
                                    : "Excluir"
                                }
                                disabled={isSelf}
                                onClick={() => setDeleteUser(user)}
                              >
                                <Trash2Icon />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UserFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <UserFormDialog
        mode="edit"
        open={Boolean(editUser)}
        onOpenChange={(open) => {
          if (!open) {
            setEditUser(null);
          }
        }}
        user={editUser}
      />
      <SoftDeleteUserDialog
        open={Boolean(deleteUser)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteUser(null);
          }
        }}
        user={deleteUser}
      />
    </div>
  );
}
