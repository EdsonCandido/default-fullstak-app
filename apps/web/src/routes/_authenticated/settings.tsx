import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@default-full-app/ui/components/card";
import { Field, FieldDescription, FieldLabel } from "@default-full-app/ui/components/field";
import { Label } from "@default-full-app/ui/components/label";
import { createFileRoute } from "@tanstack/react-router";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@default-full-app/ui/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

const themeOptions = [
  { value: "light" as const, label: "Claro", description: "Tema claro", icon: SunIcon },
  { value: "dark" as const, label: "Escuro", description: "Tema escuro", icon: MoonIcon },
  { value: "system" as const, label: "Sistema", description: "Segue o SO", icon: MonitorIcon },
];

function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Configurações"
        description="Preferências da conta e do ambiente"
        breadcrumbs={[
          { label: "Início", to: "/dashboard" },
          { label: "Configurações" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Escolha o tema da interface. Preferência persistida no navegador.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel>Tema</FieldLabel>
            <div className="grid gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => {
                const active = theme === option.value;
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-md border border-border p-4 text-left transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active && "border-primary bg-muted/40",
                    )}
                    aria-pressed={active}
                  >
                    <Icon className="text-muted-foreground" aria-hidden />
                    <Label className="font-medium">{option.label}</Label>
                    <FieldDescription>{option.description}</FieldDescription>
                  </button>
                );
              })}
            </div>
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}
