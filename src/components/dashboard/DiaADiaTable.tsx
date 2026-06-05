import { motion } from "motion/react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtNum, fmtPct, fmtData, type DiaResumo } from "@/lib/dashboard-data";

interface Props {
  dias: DiaResumo[];
  meta: number;
}

export function DiaADiaTable({ dias, meta }: Props) {
  const sorted = [...dias].sort((a, b) => (a.data > b.data ? -1 : 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="rounded-2xl border bg-card shadow-card"
    >
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Resultado Dia a Dia</h2>
          <p className="text-sm text-muted-foreground">Evolução diária do indicador consolidado</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <CalendarDays className="h-5 w-5" />
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Data</th>
              <th className="px-2 py-3">Lojas</th>
              <th className="px-2 py-3">Boletos</th>
              <th className="px-2 py-3">Identificados</th>
              <th className="px-2 py-3">Taxa</th>
              <th className="px-5 py-3 text-right">vs Meta</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => {
              const above = d.taxa >= meta;
              const pct = Math.min(100, (d.taxa / (meta * 2)) * 100);
              const diff = d.taxa - meta;
              return (
                <tr key={d.data} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3 font-semibold text-foreground tabular-nums">
                    {fmtData(d.data)}
                  </td>
                  <td className="px-2 py-3 tabular-nums text-muted-foreground">{d.lojas}</td>
                  <td className="px-2 py-3 tabular-nums text-muted-foreground">{fmtNum(d.vendas)}</td>
                  <td className="px-2 py-3 tabular-nums text-muted-foreground">
                    {fmtNum(d.identificados)}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", above ? "bg-success" : "bg-primary")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-bold tabular-nums text-foreground">
                        {fmtPct(d.taxa, 1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        above
                          ? "bg-success/12 text-success"
                          : "bg-destructive/12 text-destructive",
                      )}
                    >
                      {diff > 0 ? "+" : ""}
                      {diff.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} p.p.
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
