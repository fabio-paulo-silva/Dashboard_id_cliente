import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtNum, fmtPct, type RankingLoja } from "@/lib/dashboard-data";
import { useSort } from "@/hooks/use-sort";
import { SortTh } from "./SortTh";

const MEDALS = ["💎", "🥇", "🥈", "🥉"];

export function RankingTable({ ranking, meta }: { ranking: RankingLoja[]; meta: number }) {
  const { sorted, key, dir, toggle } = useSort(ranking, "taxa", "desc");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border bg-card shadow-card"
    >
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Ranking de Lojas</h2>
          <p className="text-sm text-muted-foreground">{ranking.length} lojas no período</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15 text-warning">
          <Trophy className="h-5 w-5" />
        </span>
      </div>

      <div className="max-h-[34rem] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</th>
              <SortTh label="Loja"       sortKey="nome"       activeKey={String(key)} dir={dir} onSort={(k) => toggle(k as keyof RankingLoja)} className="px-2" />
              <SortTh label="Praça"      sortKey="praca"      activeKey={String(key)} dir={dir} onSort={(k) => toggle(k as keyof RankingLoja)} className="hidden px-2 md:table-cell" />
              <SortTh label="Boletos"    sortKey="vendas"     activeKey={String(key)} dir={dir} onSort={(k) => toggle(k as keyof RankingLoja)} className="hidden px-2 lg:table-cell" />
              <SortTh label="% ID Cliente" sortKey="taxa"    activeKey={String(key)} dir={dir} onSort={(k) => toggle(k as keyof RankingLoja)} className="px-2" />
              <SortTh label="vs Meta"    sortKey="vsMeta"     activeKey={String(key)} dir={dir} onSort={(k) => toggle(k as keyof RankingLoja)} className="px-5 text-right" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const above = r.taxa >= meta;
              const pct = Math.min(100, (r.taxa / (meta * 1.6)) * 100);
              return (
                <tr key={r.id} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3">
                    {i < 4 ? <span className="text-lg leading-none">{MEDALS[i]}</span>
                      : <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-muted-foreground">{i + 1}</span>}
                  </td>
                  <td className="px-2 py-3">
                    <p className="font-semibold text-foreground">{r.nome}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{r.praca}</p>
                  </td>
                  <td className="hidden px-2 py-3 text-muted-foreground md:table-cell">{r.praca}</td>
                  <td className="hidden px-2 py-3 tabular-nums text-muted-foreground lg:table-cell">{fmtNum(r.vendas)}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full rounded-full", above ? "bg-primary" : "bg-muted-foreground/40")} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-semibold tabular-nums text-foreground">{fmtPct(r.taxa, 1)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      above ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive")}>
                      {r.vsMeta > 0 ? "+" : ""}{fmtPct(r.vsMeta, 1)}
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
