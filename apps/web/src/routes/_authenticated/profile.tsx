import { Button } from "@default-full-app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@default-full-app/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@default-full-app/ui/components/dialog";
import { Field, FieldGroup, FieldLabel } from "@default-full-app/ui/components/field";
import { Input } from "@default-full-app/ui/components/input";
import { Skeleton } from "@default-full-app/ui/components/skeleton";
import { Spinner } from "@default-full-app/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function ProfilePage() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery(trpc.profile.get.queryOptions());
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name);
      setJobTitle(profileQuery.data.jobTitle ?? "");
    }
  }, [profileQuery.data]);

  const updateMutation = useMutation(
    trpc.profile.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Perfil atualizado");
        setOpen(false);
        await queryClient.invalidateQueries(trpc.profile.get.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Perfil"
        description="Informações da conta autenticada"
        breadcrumbs={[
          { label: "Início", to: "/dashboard" },
          { label: "Perfil" },
        ]}
        actions={
          <Button
            type="button"
            onClick={() => setOpen(true)}
            disabled={!profileQuery.data || profileQuery.isLoading}
          >
            Editar
          </Button>
        }
      />

      {profileQuery.isLoading ? (
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </CardContent>
        </Card>
      ) : profileQuery.isError ? (
        <ErrorState
          description={profileQuery.error.message}
          onRetry={() => void profileQuery.refetch()}
        />
      ) : profileQuery.data ? (
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <UserAvatar
              name={profileQuery.data.name}
              image={profileQuery.data.image}
              className="size-16 text-base"
            />
            <div className="flex flex-col gap-1">
              <CardTitle>{profileQuery.data.name}</CardTitle>
              <CardDescription>{profileQuery.data.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">E-mail</dt>
                <dd className="text-sm">{profileQuery.data.email}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">Cargo</dt>
                <dd className="text-sm">{profileQuery.data.jobTitle || "—"}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                  Data de criação
                </dt>
                <dd className="text-sm">{formatDate(profileQuery.data.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>Atualize nome e cargo. O e-mail não pode ser alterado aqui.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) {
                toast.error("Informe um nome");
                return;
              }
              updateMutation.mutate({
                name: name.trim(),
                jobTitle: jobTitle.trim() ? jobTitle.trim() : null,
              });
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="profile-name">Nome</FieldLabel>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-job">Cargo</FieldLabel>
                <Input
                  id="profile-job"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  placeholder="Opcional"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-email">E-mail</FieldLabel>
                <Input
                  id="profile-email"
                  value={profileQuery.data?.email ?? ""}
                  disabled
                  readOnly
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Salvando…
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
