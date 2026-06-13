import { motion } from "motion/react";
import { ShieldAlert, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtNum, fmtPct, type RankingIndevido, type RankingConsultorIndevido, type SerieIndevido } from "@/lib/dashboard-data";
import { IndevidoChart } from "./IndevidoChart";

interface Props {
  lojas: RankingIndevido[];
  consultores: RankingConsultorIndevido[];
  totalAtend: number;
  lojasComIndevido: number;
  totalLojas: number;
  serieIndevido: SerieIndevido[];
}

export function UsoIndevidoTable({ lojas, consultores, totalAtend, lojasComIndevido, totalLojas, serieIndevido }: Props) {
  return (
    <div className="space-y-6">
      {/* Gráfico dia a dia */}
      <IndevidoChart serie={serieIndevido} />

      {/* Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Atendimentos uso indevido</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-destructive">{fmtNum(totalAtend)}</p>
          <p className="text-xs text-muted-foreground mt-1">no período filtrado</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Lojas com ocorrências</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-destructive">
            {lojasComIndevido}/{totalLojas}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalLojas > 0 ? fmtPct((lojasComIndevido / totalLojas) * 100, 0) : "0%"} das lojas
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Consultores com ocorrências</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-destructive">{consultores.length}</p>
          <p className="text-xs text-muted-foreground mt-1">no período filtrado</p>
        </div>
      </div>

      {/* Ranking por loja */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-2xl border bg-card shadow-card"
      >
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Lojas com Uso Indevido
            </h2>
            <p className="text-sm text-muted-foreground">
              Ordenado por % de atendimentos indevidos
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <ShieldAlert className="h-5 w-5" />
          </span>
        </div>
        {lojas.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Nenhuma ocorrência no período
          </div>
        ) : (
          <div className="max-h-[24rem] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">#</th>
                  <th className="px-2 py-3">Loja</th>
                  <th className="hidden px-2 py-3 md:table-cell">Praça</th>
                  <th className="hidden px-2 py-3 lg:table-cell">Gestor</th>
                  <th className="px-2 py-3">Atend. Indevidos</th>
                  <th className="px-5 py-3 text-right">% s/ Total</th>
                </tr>
              </thead>
              <tbody>
                {lojas.map((l, i) => (
                  <tr key={l.id} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                    <td className="px-5 py-2.5">
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                        i === 0 && "bg-destructive/20 text-destructive",
                        i > 0 && "text-muted-foreground",
                      )}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      <p className="font-semibold text-foreground">{l.nome}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{l.praca}</p>
                    </td>
                    <td className="hidden px-2 py-2.5 text-muted-foreground md:table-cell">{l.praca}</td>
                    <td className="hidden px-2 py-2.5 text-muted-foreground lg:table-cell text-xs">{l.gestor}</td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-destructive/12 px-2.5 py-0.5 text-xs font-bold text-destructive tabular-nums">
                          {fmtNum(l.atendIndevido)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          de {fmtNum(l.totalAtend)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="font-semibold tabular-nums text-destructive">
                        {fmtPct(l.taxaIndevido, 1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Ranking por consultor */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-2xl border bg-card shadow-card"
      >
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Consultores com Uso Indevido
            </h2>
            <p className="text-sm text-muted-foreground">
              Ordenado por % de atendimentos indevidos
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <ShieldX className="h-5 w-5" />
          </span>
        </div>
        {consultores.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Nenhuma ocorrência no período
          </div>
        ) : (
          <div className="max-h-[24rem] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">#</th>
                  <th className="px-2 py-3">Consultor</th>
                  <th className="hidden px-2 py-3 md:table-cell">Loja</th>
                  <th className="hidden px-2 py-3 lg:table-cell">Praça</th>
                  <th className="px-2 py-3">Atend. Indevidos</th>
                  <th className="px-5 py-3 text-right">% s/ Total</th>
                </tr>
              </thead>
              <tbody>
                {consultores.map((c, i) => (
                  <tr key={`${c.consultor}-${i}`} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                    <td className="px-5 py-2.5">
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                        i === 0 && "bg-destructive/20 text-destructive",
                        i > 0 && "text-muted-foreground",
                      )}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      <p className="font-semibold text-foreground">{c.consultor}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{c.nLojas === 1 ? c.lojas[0] : `${c.nLojas} lojas`}</p>
                    </td>
                    <td className="hidden px-2 py-2.5 text-muted-foreground md:table-cell text-xs">{c.nLojas === 1 ? c.lojas[0] : `${c.nLojas} lojas`}</td>
                    <td className="hidden px-2 py-2.5 text-muted-foreground lg:table-cell text-xs">
                      {c.nLojas === 1 ? c.lojas[0] : (
                        <span className="cursor-help text-primary underline decoration-dotted" title={c.lojas.join("\n")}>
                          {c.nLojas} lojas
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-destructive/12 px-2.5 py-0.5 text-xs font-bold text-destructive tabular-nums">
                          {fmtNum(c.atendIndevido)}
                        </span>
                        <span className="text-xs text-muted-foreground">de {fmtNum(c.totalAtend)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span className="font-semibold tabular-nums text-destructive">
                        {fmtPct(c.taxaIndevido, 1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
