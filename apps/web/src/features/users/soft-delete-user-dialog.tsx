import { Button } from "@default-full-app/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@default-full-app/ui/components/dialog";
import { Spinner } from "@default-full-app/ui/components/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

import type { UserListItem } from "./user-form-dialog";

type SoftDeleteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
};

export function SoftDeleteUserDialog({
  open,
  onOpenChange,
  user,
}: SoftDeleteUserDialogProps) {
  const queryClient = useQueryClient();

  const softDeleteMutation = useMutation(
    trpc.users.softDelete.mutationOptions({
      onSuccess: async () => {
        toast.success("Usuário excluído");
        onOpenChange(false);
        await queryClient.invalidateQueries(trpc.users.list.queryFilter());
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir usuário</DialogTitle>
          <DialogDescription>
            A conta de{" "}
            <span className="font-medium text-foreground">
              {user?.name ?? "este usuário"}
            </span>{" "}
            será desativada (soft-delete). Os dados permanecem no sistema e a conta
            poderá ser restaurada depois. Sessões ativas serão encerradas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={softDeleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!user || softDeleteMutation.isPending}
            onClick={() => {
              if (!user) {
                return;
              }
              softDeleteMutation.mutate({ id: user.id });
            }}
          >
            {softDeleteMutation.isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Excluindo…
              </>
            ) : (
              "Excluir"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
