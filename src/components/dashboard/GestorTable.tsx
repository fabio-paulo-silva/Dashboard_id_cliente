import { motion } from "motion/react";
import { UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtNum, fmtPct, type GestorResumo } from "@/lib/dashboard-data";

const MEDALS = ["💎", "🥇", "🥈", "🥉"];

interface Props {
  gestores: GestorResumo[];
  meta: number;
}

export function GestorTable({ gestores, meta }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="rounded-2xl border bg-card shadow-card"
    >
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Ranking por Gestor</h2>
          <p className="text-sm text-muted-foreground">Desempenho consolidado por gestor</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/30 text-foreground">
          <UserCheck className="h-5 w-5" />
        </span>
      </div>

      <div className="max-h-[28rem] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">#</th>
              <th className="px-2 py-3">Gestor</th>
              <th className="hidden px-2 py-3 md:table-cell">Praça</th>
              <th className="hidden px-2 py-3 lg:table-cell">Lojas</th>
              <th className="hidden px-2 py-3 lg:table-cell">Boletos</th>
              <th className="px-2 py-3">% ID Cliente</th>
              <th className="px-4 py-3 text-right">vs Meta</th>
            </tr>
          </thead>
          <tbody>
            {gestores.map((g, i) => {
              const above = g.taxa >= meta;
              const pct = Math.min(100, (g.taxa / (meta * 1.6)) * 100);
              const diff = g.taxa - meta;
              return (
                <tr key={g.gestor} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    {i < 4 ? (
                      <span className="text-lg leading-none">{MEDALS[i]}</span>
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <p className="font-semibold text-foreground">{g.gestor}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{g.praca}</p>
                  </td>
                  <td className="hidden px-2 py-3 text-muted-foreground md:table-cell">{g.praca}</td>
                  <td className="hidden px-2 py-3 tabular-nums text-muted-foreground lg:table-cell">{g.lojas}</td>
                  <td className="hidden px-2 py-3 tabular-nums text-muted-foreground lg:table-cell">{fmtNum(g.vendas)}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", above ? "bg-primary" : "bg-muted-foreground/50")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-semibold tabular-nums text-foreground">
                        {fmtPct(g.taxa, 1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        above ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
                      )}
                    >
                      {diff > 0 ? "+" : ""}{fmtPct(diff, 1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
