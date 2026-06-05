import { motion } from "motion/react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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

export function FilterBar({ dados, filtros, onChange }: FilterBarProps) {
  const datas = datasDisponiveis(dados);

  const lojasDisponiveis = dados.lojas
    .filter((l) => {
      if (filtros.praca !== "all" && l.praca !== filtros.praca) return false;
      if (filtros.gestor !== "all" && l.gestor !== filtros.gestor) return false;
      return true;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const set = (patch: Partial<Filtros>) => onChange({ ...filtros, ...patch });

  const reset = () =>
    onChange({ praca: "all", loja: "all", gestor: "all", dataInicio: "all", dataFim: "all" });

  const isDefault =
    filtros.praca === "all" &&
    filtros.loja === "all" &&
    filtros.gestor === "all" &&
    filtros.dataInicio === "all" &&
    filtros.dataFim === "all";

  // Datas válidas para o filtro "Até" (>= dataInicio)
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
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* De */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">De</span>
          <Select
            value={filtros.dataInicio}
            onValueChange={(v) => {
              // Se dataFim < nova dataInicio, reset dataFim
              const newFim = filtros.dataFim !== "all" && filtros.dataFim < v ? "all" : filtros.dataFim;
              set({ dataInicio: v, dataFim: newFim });
            }}
          >
            <SelectTrigger className="h-9 min-w-[130px] bg-background">
              <SelectValue placeholder="Início" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Início do período</SelectItem>
              {datas.map((d) => (
                <SelectItem key={d} value={d}>{fmtData(d)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Até */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Até</span>
          <Select
            value={filtros.dataFim}
            onValueChange={(v) => set({ dataFim: v })}
          >
            <SelectTrigger className="h-9 min-w-[130px] bg-background">
              <SelectValue placeholder="Fim" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Fim do período</SelectItem>
              {datasAte.map((d) => (
                <SelectItem key={d} value={d}>{fmtData(d)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FilterSelect
          label="Praça"
          value={filtros.praca}
          placeholder="Todas as praças"
          onValueChange={(v) => set({ praca: v, loja: "all" })}
          options={dados.pracas.map((p) => ({ value: p, label: p }))}
        />

        <FilterSelect
          label="Gestor"
          value={filtros.gestor}
          placeholder="Todos os gestores"
          onValueChange={(v) => set({ gestor: v, loja: "all" })}
          options={dados.gestores.map((g) => ({ value: g, label: g }))}
        />

        <FilterSelect
          label="Loja"
          value={filtros.loja}
          placeholder="Todas as lojas"
          onValueChange={(v) => set({ loja: v })}
          options={lojasDisponiveis.map((l) => ({ value: l.id, label: l.nome }))}
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

function FilterSelect({
  label, value, placeholder, onValueChange, options,
}: {
  label: string; value: string; placeholder: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex min-w-[160px] flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
