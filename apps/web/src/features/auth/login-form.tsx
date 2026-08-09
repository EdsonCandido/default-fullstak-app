import { Button } from "@default-full-app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@default-full-app/ui/components/card";
import { Checkbox } from "@default-full-app/ui/components/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@default-full-app/ui/components/field";
import { Input } from "@default-full-app/ui/components/input";
import { Spinner } from "@default-full-app/ui/components/spinner";
import { cn } from "@default-full-app/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { APP_NAME } from "@/lib/constants";
import { authClient } from "@/lib/auth-client";

const REMEMBER_KEY = "platform:remember-email";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  remember: z.boolean(),
});

type LoginFormProps = React.ComponentProps<"div">;

export function LoginForm({ className, ...props }: LoginFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const rememberedEmail =
    typeof window !== "undefined" ? (localStorage.getItem(REMEMBER_KEY) ?? "") : "";

  const form = useForm({
    defaultValues: {
      email: rememberedEmail,
      password: "",
      remember: Boolean(rememberedEmail),
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          rememberMe: value.remember,
        },
        {
          onSuccess: () => {
            if (value.remember) {
              localStorage.setItem(REMEMBER_KEY, value.email);
            } else {
              localStorage.removeItem(REMEMBER_KEY);
            }
            toast.success("Login realizado com sucesso");
            void navigate({ to: "/dashboard" });
          },
          onError: (ctx) => {
            const message = ctx.error.message || "Credenciais inválidas";
            setFormError(message);
            toast.error(message);
          },
        },
      );
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="font-semibold text-sm">{APP_NAME.slice(0, 1)}</span>
          </div>
          <CardTitle className="text-xl">{APP_NAME}</CardTitle>
          <CardDescription>Entre com e-mail e senha para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="email">
                {(field) => {
                  const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={invalid || undefined}>
                      <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        autoComplete="email"
                        placeholder="admin@admin.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={invalid || undefined}
                        required
                      />
                      {invalid
                        ? field.state.meta.errors.map((error) => (
                            <FieldError key={error?.message}>{error?.message}</FieldError>
                          ))
                        : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="password">
                {(field) => {
                  const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={invalid || undefined}>
                      <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          aria-invalid={invalid || undefined}
                          className="pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="absolute top-1/2 right-1 -translate-y-1/2"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </Button>
                      </div>
                      {invalid
                        ? field.state.meta.errors.map((error) => (
                            <FieldError key={error?.message}>{error?.message}</FieldError>
                          ))
                        : null}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="remember">
                {(field) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked === true)}
                    />
                    <FieldLabel htmlFor={field.name} className="font-normal">
                      Lembrar acesso
                    </FieldLabel>
                  </Field>
                )}
              </form.Field>

              {formError ? (
                <FieldDescription className="text-destructive text-center">
                  {formError}
                </FieldDescription>
              ) : null}

              <form.Subscribe
                selector={(state) => ({
                  isSubmitting: state.isSubmitting,
                })}
              >
                {({ isSubmitting }) => (
                  <Field>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Spinner data-icon="inline-start" />
                          Entrando…
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </Field>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
