import { Button } from "@default-full-app/ui/components/button";
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
import { Spinner } from "@default-full-app/ui/components/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  jobTitle: string | null;
  image: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
};

type UserFormDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserListItem | null;
};

export function UserFormDialog({
  mode,
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    if (mode === "edit" && user) {
      setName(user.name);
      setEmail(user.email);
      setJobTitle(user.jobTitle ?? "");
      setPassword("");
      return;
    }
    setName("");
    setEmail("");
    setJobTitle("");
    setPassword("");
  }, [open, mode, user]);

  const createMutation = useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Usuário criado");
        onOpenChange(false);
        await queryClient.invalidateQueries(trpc.users.list.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.users.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Usuário atualizado");
        onOpenChange(false);
        await queryClient.invalidateQueries(trpc.users.list.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Novo usuário" : "Editar usuário"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Crie uma conta com e-mail e senha para acesso à plataforma."
              : "Atualize os dados da conta. Deixe a senha em branco para manter a atual."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) {
              toast.error("Informe um nome");
              return;
            }
            if (!email.trim()) {
              toast.error("Informe um e-mail");
              return;
            }
            if (mode === "create") {
              if (password.length < 8) {
                toast.error("A senha deve ter pelo menos 8 caracteres");
                return;
              }
              createMutation.mutate({
                name: name.trim(),
                email: email.trim(),
                password,
                jobTitle: jobTitle.trim() ? jobTitle.trim() : null,
              });
              return;
            }
            if (!user) {
              return;
            }
            if (password && password.length < 8) {
              toast.error("A senha deve ter pelo menos 8 caracteres");
              return;
            }
            updateMutation.mutate({
              id: user.id,
              name: name.trim(),
              email: email.trim(),
              jobTitle: jobTitle.trim() ? jobTitle.trim() : null,
              ...(password ? { password } : {}),
            });
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="user-name">Nome</FieldLabel>
              <Input
                id="user-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-email">E-mail</FieldLabel>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-job">Cargo</FieldLabel>
              <Input
                id="user-job"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="Opcional"
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-password">
                {mode === "create" ? "Senha" : "Nova senha (opcional)"}
              </FieldLabel>
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required={mode === "create"}
                minLength={mode === "create" ? 8 : undefined}
                autoComplete="new-password"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Salvando…
                </>
              ) : mode === "create" ? (
                "Criar"
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
