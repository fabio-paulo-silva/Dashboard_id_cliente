import { motion } from "motion/react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchSelect } from "./SearchSelect";
import { fmtData } from "@/lib/dashboard-data";
import type { DadosConsolidados, Filtros } from "@/lib/dashboard-data";

interface FilterBarProps {
  dados: DadosConsolidados;
  filtros: Filtros;
  onChange: (next: Filtros) => void;
}

function datasDisponiveis(dados: DadosConsolidados): string[] {
  return [...new Set(dados.registros.map((r) => r.data))].sort();
}

const EMPTY: Filtros = {
  praca: "all", loja: "all", gestor: "all", consultor: "all",
  dataInicio: "all", dataFim: "all",
};

export function FilterBar({ dados, filtros, onChange }: FilterBarProps) {
  const datas = datasDisponiveis(dados);
  const set = (patch: Partial<Filtros>) => onChange({ ...filtros, ...patch });
  const reset = () => onChange({ ...EMPTY });

  const isDefault = Object.entries(EMPTY).every(
    ([k, v]) => filtros[k as keyof Filtros] === v,
  );

  // Lojas filtradas por praça/gestor (para o dropdown de loja)
  const lojasOpcoes = dados.lojas
    .filter((l) => {
      if (filtros.praca !== "all" && l.praca !== filtros.praca) return false;
      if (filtros.gestor !== "all" && l.gestor !== filtros.gestor) return false;
      return true;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map((l) => ({ value: l.id, label: l.nome }));

  // Consultores filtrados por loja/praça/gestor
  const consultoresOpcoes = (() => {
    const set = new Set<string>();
    for (const r of dados.registrosConsultor ?? []) {
      if (filtros.loja !== "all" && r.lojaId !== filtros.loja) continue;
      const loja = dados.lojas.find((l) => l.id === r.lojaId);
      if (filtros.praca !== "all" && loja?.praca !== filtros.praca) continue;
      if (filtros.gestor !== "all" && loja?.gestor !== filtros.gestor) continue;
      set.add(r.consultor);
    }
    return [...set].sort().map((c) => ({ value: c, label: c }));
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
        {!isDefault && (
          <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
            ativos
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
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

        {/* Praça */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Praça</span>
          <Select
            value={filtros.praca}
            onValueChange={(v) => set({ praca: v, loja: "all", consultor: "all" })}
          >
            <SelectTrigger className="h-9 min-w-[140px] bg-background">
              <SelectValue placeholder="Todas as praças" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as praças</SelectItem>
              {dados.pracas.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Gestor */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Gestor</span>
          <Select
            value={filtros.gestor}
            onValueChange={(v) => set({ gestor: v, loja: "all", consultor: "all" })}
          >
            <SelectTrigger className="h-9 min-w-[160px] bg-background">
              <SelectValue placeholder="Todos os gestores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os gestores</SelectItem>
              {dados.gestores.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Loja — com busca */}
        <SearchSelect
          label="Loja"
          value={filtros.loja}
          placeholder="Todas as lojas"
          options={lojasOpcoes}
          onValueChange={(v) => set({ loja: v, consultor: "all" })}
          className="min-w-[180px]"
        />

        {/* Consultor — com busca */}
        <SearchSelect
          label="Consultor"
          value={filtros.consultor}
          placeholder="Todos os consultores"
          options={consultoresOpcoes}
          onValueChange={(v) => set({ consultor: v })}
          className="min-w-[200px]"
        />

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
