import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtNum, fmtPct, fmtData, type DiaResumo, type DadosConsolidados, type Filtros } from "@/lib/dashboard-data";
import { useSort } from "@/hooks/use-sort";
import { SortTh } from "./SortTh";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EvolutionChart } from "./EvolutionChart";

type GrupoTipo = "geral" | "loja" | "consultor" | "gestor" | "praca";

interface Props {
  dias: DiaResumo[];
  meta: number;
  dados: DadosConsolidados;
  filtros: Filtros;
}

function computarSerieGrupo(
  dados: DadosConsolidados,
  filtros: Filtros,
  tipo: GrupoTipo,
  valor: string,
) {
  const inicio = filtros.dataInicio !== "all" ? filtros.dataInicio : dados.periodo.inicio;
  const fim = filtros.dataFim !== "all" ? filtros.dataFim : dados.periodo.fim;

  if (tipo === "geral") return null;

  const regs = tipo === "consultor"
    ? (dados.registrosConsultor ?? []).filter((r) => r.consultor === valor && r.data >= inicio && r.data <= fim)
    : dados.registros.filter((r) => {
        if (r.data < inicio || r.data > fim) return false;
        const loja = dados.lojas.find((l) => l.id === r.lojaId);
        if (!loja) return false;
        if (tipo === "loja") return r.lojaId === valor;
        if (tipo === "gestor") return loja.gestor === valor;
        if (tipo === "praca") return loja.praca === valor;
        return false;
      });

  const map = new Map<string, { vendas: number; identificados: number }>();
  for (const r of regs) {
    const cur = map.get(r.data) ?? { vendas: 0, identificados: 0 };
    cur.vendas += r.vendas;
    cur.identificados += r.identificados;
    map.set(r.data, cur);
  }

  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([data, v]) => ({
      data,
      vendas: v.vendas,
      identificados: v.identificados,
      taxa: v.vendas === 0 ? 0 : Number(((v.identificados / v.vendas) * 100).toFixed(2)),
    }));
}

export function DiaADiaTable({ dias, meta, dados, filtros }: Props) {
  const { sorted, key, dir, toggle } = useSort(dias, "data", "desc");

  const [grupoTipo, setGrupoTipo] = useState<GrupoTipo>("geral");
  const [grupoValor, setGrupoValor] = useState("all");

  const opcoesPorTipo = useMemo((): { value: string; label: string }[] => {
    if (grupoTipo === "loja") return dados.lojas.sort((a,b)=>a.nome.localeCompare(b.nome)).map((l) => ({ value: l.id, label: l.nome }));
    if (grupoTipo === "consultor") return dados.consultores.map((c) => ({ value: c, label: c }));
    if (grupoTipo === "gestor") return dados.gestores.map((g) => ({ value: g, label: g }));
    if (grupoTipo === "praca") return dados.pracas.map((p) => ({ value: p, label: p }));
    return [];
  }, [grupoTipo, dados]);

  const serieGrupo = useMemo(
    () => grupoValor !== "all" ? computarSerieGrupo(dados, filtros, grupoTipo, grupoValor) : null,
    [dados, filtros, grupoTipo, grupoValor],
  );

  const tituloGrupo = grupoValor !== "all"
    ? opcoesPorTipo.find((o) => o.value === grupoValor)?.label ?? grupoValor
    : null;

  return (
    <div className="space-y-5">
      {/* Seletor de grupo */}
      <div className="rounded-2xl border bg-card p-4 shadow-card">
        <p className="mb-3 text-sm font-bold text-foreground">Analisar evolução por grupo</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Tipo</span>
            <Select value={grupoTipo} onValueChange={(v) => { setGrupoTipo(v as GrupoTipo); setGrupoValor("all"); }}>
              <SelectTrigger className="h-9 w-40 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral (todos)</SelectItem>
                <SelectItem value="loja">Loja</SelectItem>
                <SelectItem value="consultor">Consultor</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="praca">Praça</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {grupoTipo !== "geral" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground capitalize">{grupoTipo}</span>
              <Select value={grupoValor} onValueChange={setGrupoValor}>
                <SelectTrigger className="h-9 min-w-[200px] bg-background">
                  <SelectValue placeholder={`Selecionar ${grupoTipo}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">— Selecione —</SelectItem>
                  {opcoesPorTipo.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico do grupo selecionado */}
      {serieGrupo && serieGrupo.length > 0 && (
        <EvolutionChart
          serie={serieGrupo}
          meta={meta}
          titulo={`Evolução — ${tituloGrupo}`}
        />
      )}

      {/* Tabela dia a dia */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border bg-card shadow-card"
      >
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Resultado Dia a Dia</h2>
            <p className="text-sm text-muted-foreground">Evolução diária consolidada</p>
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
