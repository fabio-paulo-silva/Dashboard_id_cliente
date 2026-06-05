import { motion } from "motion/react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtNum, fmtPct, fmtData, type DiaResumo, type SerieDiaria } from "@/lib/dashboard-data";
import { useSort } from "@/hooks/use-sort";
import { SortTh } from "./SortTh";
import { EvolutionChart } from "./EvolutionChart";

interface Props {
  dias: DiaResumo[];
  serie: SerieDiaria[];
  meta: number;
  tituloGrafico?: string;
}

export function DiaADiaTable({ dias, serie, meta, tituloGrafico }: Props) {
  const { sorted, key, dir, toggle } = useSort(dias, "data", "desc");

  return (
    <div className="space-y-5">
      <EvolutionChart serie={serie} meta={meta} titulo={tituloGrafico} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border bg-card shadow-card"
      >
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Resultado Dia a Dia</h2>
            <p className="text-sm text-muted-foreground">
              {tituloGrafico ? `Filtrado: ${tituloGrafico}` : "Consolidado — use os filtros para detalhar por praça, gestor, loja ou consultor"}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <CalendarDays className="h-5 w-5" />
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b text-left">
                <SortTh label="Data"          sortKey="data"          activeKey={String(key)} dir={dir} onSort={(k) => toggle(k as keyof DiaResumo)} className="px-5" />
                <SortTh label="Lojas"         sortKey="lojas"         activeKey={String(key)} dir={dir} onSort={(k) => toggle(k as keyof DiaResumo)} className="px-2" />
                <SortTh label="Boletos"       sortKey="vendas"        activeKey={String(key)} dir={dir} onSort={(k) => toggle(k as keyof DiaResumo)} className="px-2" />
                <SortTh label="Identificados" sortKey="identificados" activeKey={String(key)} dir={dir} onSort={(k) => toggle(k as keyof DiaResumo)} className="px-2" />
                <SortTh label="% ID Cliente"  sortKey="taxa"          activeKey={String(key)} dir={dir} onSort={(k) => toggle(k as keyof DiaResumo)} className="px-2" />
                <SortTh label="vs Meta"       sortKey="taxa"          activeKey={String(key)} dir={dir} onSort={(k) => toggle(k as keyof DiaResumo)} className="px-5 text-right" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => {
                const above = d.taxa >= meta;
                const pct = Math.min(100, (d.taxa / (meta * 1.6)) * 100);
                const diff = d.taxa - meta;
                return (
                  <tr key={d.data} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3 font-semibold text-foreground tabular-nums">{fmtData(d.data)}</td>
                    <td className="px-2 py-3 tabular-nums text-muted-foreground">{d.lojas}</td>
                    <td className="px-2 py-3 tabular-nums text-muted-foreground">{fmtNum(d.vendas)}</td>
                    <td className="px-2 py-3 tabular-nums text-muted-foreground">{fmtNum(d.identificados)}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className={cn("h-full rounded-full", above ? "bg-primary" : "bg-muted-foreground/40")} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-bold tabular-nums text-foreground">{fmtPct(d.taxa, 1)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        above ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive")}>
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
    </div>
  );
}
