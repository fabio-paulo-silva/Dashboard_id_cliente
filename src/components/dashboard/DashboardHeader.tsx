import { motion } from "motion/react";
import { CalendarDays } from "lucide-react";

interface DashboardHeaderProps {
  indicador: string;
  descricao: string;
  atualizadoEm: string;
}

export function DashboardHeader({ descricao, atualizadoEm }: DashboardHeaderProps) {
  const data = new Date(atualizadoEm).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="relative overflow-hidden border-b bg-gradient-primary">
      {/* Efeitos de fundo */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          {/* Logo + título */}
          <div className="flex items-center gap-5">
            <img
              src={`${import.meta.env.BASE_URL}logo-gentil.svg`}
              alt="Gentil Negócios"
              className="h-10 w-auto shrink-0"
            />
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Painel Executivo · Indicador
              </p>
              <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                % ID Cliente
              </h1>
              <p className="mt-0.5 text-sm text-white/70">{descricao}</p>
            </div>
          </div>

          {/* Data de atualização */}
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="font-medium">Atualizado em {data}</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
