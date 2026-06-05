import { motion } from "motion/react";
import { BadgeCheck, CalendarDays } from "lucide-react";

interface DashboardHeaderProps {
  indicador: string;
  descricao: string;
  atualizadoEm: string;
}

export function DashboardHeader({ indicador, descricao, atualizadoEm }: DashboardHeaderProps) {
  const data = new Date(atualizadoEm + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="relative overflow-hidden border-b bg-gradient-primary">
      <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-primary-foreground/5 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/15 text-primary-foreground backdrop-blur">
              <BadgeCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
                Painel Executivo
              </p>
              <h1 className="font-display text-2xl font-extrabold text-primary-foreground sm:text-3xl">
                {indicador}
              </h1>
              <p className="text-sm text-primary-foreground/80">{descricao}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-primary-foreground/12 px-3.5 py-2 text-sm text-primary-foreground backdrop-blur">
            <CalendarDays className="h-4 w-4" />
            <span className="font-medium">Atualizado em {data}</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
