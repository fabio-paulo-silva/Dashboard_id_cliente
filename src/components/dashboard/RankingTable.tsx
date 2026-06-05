import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtNum, fmtPct, type RankingLoja } from "@/lib/dashboard-data";

interface RankingTableProps {
  ranking: RankingLoja[];
  meta: number;
}

export function RankingTable({ ranking, meta }: RankingTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.22 }}
      className="rounded-2xl border bg-card shadow-card"
    >
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Ranking de lojas</h2>
          <p className="text-sm text-muted-foreground">Desempenho individual frente à meta</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15 text-warning">
          <Trophy className="h-5 w-5" />
        </span>
      </div>

      <div className="max-h-[28rem] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">#</th>
              <th className="px-2 py-3">Loja</th>
              <th className="hidden px-2 py-3 md:table-cell">Praça</th>
              <th className="hidden px-2 py-3 lg:table-cell">Vendas</th>
              <th className="px-2 py-3">Taxa</th>
              <th className="px-5 py-3 text-right">vs Meta</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r, i) => {
              const above = r.taxa >= meta;
              const pct = Math.min(100, (r.taxa / 100) * 100);
              return (
                <tr key={r.id} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3">
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
                  <td className="px-2 py-3">
                    <p className="font-semibold text-foreground">{r.nome}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{r.praca}</p>
                  </td>
                  <td className="hidden px-2 py-3 text-muted-foreground md:table-cell">{r.praca}</td>
                  <td className="hidden px-2 py-3 tabular-nums text-muted-foreground lg:table-cell">
                    {fmtNum(r.vendas)}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", above ? "bg-success" : "bg-primary")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-semibold tabular-nums text-foreground">
                        {fmtPct(r.taxa, 1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        above ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
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
