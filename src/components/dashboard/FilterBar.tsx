import { motion } from "motion/react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MultiSearchSelect } from "./MultiSearchSelect";
import { fmtData } from "@/lib/dashboard-data";
import type { DadosConsolidados, Filtros } from "@/lib/dashboard-data";

interface FilterBarProps {
  dados: DadosConsolidados;
  filtros: Filtros;
  onChange: (next: Filtros) => void;
}

const MESES_NOMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

function fmtMes(mes: string) {
  const [year, month] = mes.split("-");
  return `${MESES_NOMES[parseInt(month) - 1]} ${year}`;
}

function datasDisponiveis(dados: DadosConsolidados): string[] {
  return [...new Set(dados.registros.map((r) => r.data))].sort();
}

function mesesDisponiveis(dados: DadosConsolidados): string[] {
  return [...new Set(dados.registros.map((r) => r.data.slice(0, 7)))].sort();
}

export const FILTROS_VAZIOS: Filtros = {
  pracas: [], lojas: [], gestores: [], consultores: [], meses: [],
  dataInicio: "all", dataFim: "all",
};

export function FilterBar({ dados, filtros, onChange }: FilterBarProps) {
  const datas = datasDisponiveis(dados);
  const meses = mesesDisponiveis(dados);
  const set = (patch: Partial<Filtros>) => onChange({ ...filtros, ...patch });
  const reset = () => onChange({ ...FILTROS_VAZIOS });

  const isDefault =
    filtros.pracas.length === 0 &&
    filtros.lojas.length === 0 &&
    filtros.gestores.length === 0 &&
    filtros.consultores.length === 0 &&
    filtros.meses.length === 0 &&
    filtros.dataInicio === "all" &&
    filtros.dataFim === "all";

  const activeCount =
    filtros.pracas.length + filtros.lojas.length + filtros.gestores.length +
    filtros.consultores.length + filtros.meses.length +
    (filtros.dataInicio !== "all" ? 1 : 0) + (filtros.dataFim !== "all" ? 1 : 0);

  // Lojas filtradas por praça/gestor selecionados
  const lojasOpcoes = dados.lojas
    .filter((l) => {
      if (filtros.pracas.length > 0 && !filtros.pracas.includes(l.praca)) return false;
      if (filtros.gestores.length > 0 && !filtros.gestores.includes(l.gestor)) return false;
      return true;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map((l) => ({ value: l.id, label: l.nome }));

  // Consultores filtrados por loja/praça/gestor selecionados
  const consultoresOpcoes = (() => {
    const s = new Set<string>();
    for (const r of dados.registrosConsultor ?? []) {
      if (filtros.lojas.length > 0 && !filtros.lojas.includes(r.lojaId)) continue;
      const loja = dados.lojas.find((l) => l.id === r.lojaId);
      if (filtros.pracas.length > 0 && !filtros.pracas.includes(loja?.praca ?? "")) continue;
      if (filtros.gestores.length > 0 && !filtros.gestores.includes(loja?.gestor ?? "")) continue;
      s.add(r.consultor);
    }
    return [...s].sort().map((c) => ({ value: c, label: c }));
  })();

  const datasAte = filtros.dataInicio !== "all"
    ? datas.filter((d) => d >= filtros.dataInicio)
    : datas;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border bg-card p-4 shadow-card"
    >
      <div className="mb-3 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold text-foreground">Filtros</span>
        {activeCount > 0 && (
          <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
            {activeCount} {activeCount === 1 ? "ativo" : "ativos"}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* Mês */}
        <MultiSearchSelect
          label="Mês"
          values={filtros.meses}
          placeholder="Todos os meses"
          options={meses.map((m) => ({ value: m, label: fmtMes(m) }))}
          onValuesChange={(v) => set({ meses: v })}
          className="min-w-[160px]"
        />

        {/* Praça */}
        <MultiSearchSelect
          label="Praça"
          values={filtros.pracas}
          placeholder="Todas as praças"
          options={dados.pracas.map((p) => ({ value: p, label: p }))}
          onValuesChange={(v) => set({ pracas: v, lojas: [], consultores: [] })}
          className="min-w-[150px]"
        />

        {/* Gestor */}
        <MultiSearchSelect
          label="Gestor"
          values={filtros.gestores}
          placeholder="Todos os gestores"
          options={dados.gestores.map((g) => ({ value: g, label: g }))}
          onValuesChange={(v) => set({ gestores: v, lojas: [], consultores: [] })}
          className="min-w-[170px]"
        />

        {/* Loja */}
        <MultiSearchSelect
          label="Loja"
          values={filtros.lojas}
          placeholder="Todas as lojas"
          options={lojasOpcoes}
          onValuesChange={(v) => set({ lojas: v, consultores: [] })}
          className="min-w-[180px]"
        />

        {/* Consultor */}
        <MultiSearchSelect
          label="Consultor"
          values={filtros.consultores}
          placeholder="Todos os consultores"
          options={consultoresOpcoes}
          onValuesChange={(v) => set({ consultores: v })}
          className="min-w-[200px]"
        />

        {/* Intervalo de datas */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">De</span>
          <Select
            value={filtros.dataInicio}
            onValueChange={(v) => {
              const newFim = filtros.dataFim !== "all" && filtros.dataFim < v ? "all" : filtros.dataFim;
              set({ dataInicio: v, dataFim: newFim });
            }}
          >
            <SelectTrigger className="h-9 min-w-[130px] bg-background">
              <SelectValue placeholder="Início" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Início</SelectItem>
              {datas.map((d) => <SelectItem key={d} value={d}>{fmtData(d)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Até</span>
          <Select value={filtros.dataFim} onValueChange={(v) => set({ dataFim: v })}>
            <SelectTrigger className="h-9 min-w-[130px] bg-background">
              <SelectValue placeholder="Fim" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Fim</SelectItem>
              {datasAte.map((d) => <SelectItem key={d} value={d}>{fmtData(d)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          disabled={isDefault}
          className="ml-auto gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Limpar
        </Button>
      </div>
    </motion.div>
  );
}
