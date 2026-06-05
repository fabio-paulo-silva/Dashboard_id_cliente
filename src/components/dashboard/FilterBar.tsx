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
import { cn } from "@/lib/utils";
import { fmtData } from "@/lib/dashboard-data";
import type { DadosConsolidados, Filtros } from "@/lib/dashboard-data";

interface FilterBarProps {
  dados: DadosConsolidados;
  filtros: Filtros;
  onChange: (next: Filtros) => void;
}

const PERIODOS: { label: string; value: Filtros["dias"] }[] = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "Tudo", value: "all" },
];

// Datas disponíveis únicas ordenadas desc
function datasDisponiveis(dados: DadosConsolidados): string[] {
  return [...new Set(dados.registros.map((r) => r.data))].sort().reverse();
}

export function FilterBar({ dados, filtros, onChange }: FilterBarProps) {
  const lojasDisponiveis = dados.lojas
    .filter((l) => {
      if (filtros.praca !== "all" && l.praca !== filtros.praca) return false;
      if (filtros.gestor !== "all" && l.gestor !== filtros.gestor) return false;
      return true;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const datas = datasDisponiveis(dados);

  const set = (patch: Partial<Filtros>) => onChange({ ...filtros, ...patch });

  const reset = () =>
    onChange({ dias: 30, praca: "all", loja: "all", gestor: "all", data: "all" });

  const isDefault =
    filtros.dias === 30 &&
    filtros.praca === "all" &&
    filtros.loja === "all" &&
    filtros.gestor === "all" &&
    filtros.data === "all";

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
        {/* Data específica */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Data</span>
          <Select
            value={filtros.data}
            onValueChange={(v) => set({ data: v, dias: v === "all" ? 30 : "all" })}
          >
            <SelectTrigger className="h-9 min-w-[130px] bg-background">
              <SelectValue placeholder="Todos os dias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os dias</SelectItem>
              {datas.map((d) => (
                <SelectItem key={d} value={d}>
                  {fmtData(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Período — só ativo quando não há data específica */}
        {filtros.data === "all" && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Período</span>
            <div className="inline-flex rounded-lg border bg-muted/50 p-1">
              {PERIODOS.map((p) => (
                <button
                  key={String(p.value)}
                  onClick={() => set({ dias: p.value })}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                    filtros.dias === p.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

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
  label,
  value,
  placeholder,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  placeholder: string;
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
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
