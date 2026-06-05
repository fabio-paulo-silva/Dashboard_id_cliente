import { motion } from "motion/react";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtNum, fmtPct, type RankingConsultor } from "@/lib/dashboard-data";

interface Props {
  ranking: RankingConsultor[];
  meta: number;
}

export function ConsultorTable({ ranking, meta }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="rounded-2xl border bg-card shadow-card"
    >
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Ranking de Consultores</h2>
          <p className="text-sm text-muted-foreground">
            {ranking.length} consultores com atendimento no período
          </p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Users className="h-5 w-5" />
        </span>
      </div>

      <div className="max-h-[32rem] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">#</th>
              <th className="px-2 py-3">Consultor</th>
              <th className="hidden px-2 py-3 md:table-cell">Loja</th>
              <th className="hidden px-2 py-3 lg:table-cell">Praça</th>
              <th className="hidden px-2 py-3 lg:table-cell">Boletos</th>
              <th className="px-2 py-3">Taxa</th>
              <th className="px-4 py-3 text-right">vs Meta</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r, i) => {
              const above = r.taxa >= meta;
              const pct = Math.min(100, (r.taxa / (meta * 2)) * 100);
              return (
                <tr
                  key={`${r.consultor}-${r.lojaId}`}
                  className="border-b last:border-0 transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                        i === 0 && "bg-warning/20 text-warning",
                        i === 1 && "bg-muted text-foreground",
                        i === 2 && "bg-accent text-accent-foreground",
                        i > 2 && "text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <p className="font-semibold text-foreground leading-tight">{r.consultor}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{r.lojaNome}</p>
                  </td>
                  <td className="hidden px-2 py-2.5 text-muted-foreground md:table-cell text-xs">
                    {r.lojaNome}
                  </td>
                  <td className="hidden px-2 py-2.5 text-muted-foreground lg:table-cell text-xs">
                    {r.praca}
                  </td>
                  <td className="hidden px-2 py-2.5 tabular-nums text-muted-foreground lg:table-cell text-xs">
                    {fmtNum(r.vendas)}
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", above ? "bg-success" : "bg-primary")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-semibold tabular-nums text-foreground text-xs">
                        {fmtPct(r.taxa, 1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        above
                          ? "bg-success/12 text-success"
                          : "bg-destructive/12 text-destructive",
                      )}
                    >
                      {r.vsMeta > 0 ? "+" : ""}
                      {r.vsMeta.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} p.p.
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
