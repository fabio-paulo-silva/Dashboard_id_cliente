import { motion } from "motion/react";
import {
  Area, AreaChart, CartesianGrid, LabelList,
  ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { fmtData, fmtNum, fmtPct, type SerieDiaria } from "@/lib/dashboard-data";

interface EvolutionChartProps {
  serie: SerieDiaria[];
  meta: number;
  titulo?: string;
}

// ── Tooltip rico ──────────────────────────────────────────────────────────────
function makeTooltip(serie: SerieDiaria[], meta: number) {
  return function ChartTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload as SerieDiaria;
    const idx = serie.findIndex((s) => s.data === p.data);
    const prev = idx > 0 ? serie[idx - 1] : null;
    const delta = prev != null ? p.taxa - prev.taxa : null;
    const vsMeta = p.taxa - meta;
    const aboveMeta = p.taxa >= meta;

    return (
      <div className="min-w-[200px] rounded-xl border bg-popover shadow-elevated overflow-hidden">
        {/* cabeçalho */}
        <div className="border-b bg-muted/50 px-4 py-2.5">
          <p className="text-xs font-bold text-foreground">{fmtData(p.data)}</p>
        </div>

        {/* métrica principal */}
        <div className="px-4 py-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-xs text-muted-foreground">% ID Cliente</span>
            <span className={`text-xl font-bold tabular-nums ${aboveMeta ? "text-primary" : "text-foreground"}`}>
              {fmtPct(p.taxa, 1)}
            </span>
          </div>

          {/* vs meta */}
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">vs Meta ({fmtPct(meta, 0)})</span>
            <span className={`text-xs font-bold tabular-nums ${vsMeta >= 0 ? "text-primary" : "text-destructive"}`}>
              {vsMeta >= 0 ? "+" : ""}{fmtPct(vsMeta, 1)} pp
            </span>
          </div>

          {/* vs dia anterior */}
          {delta !== null && (
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">vs dia anterior</span>
              <span className={`text-xs font-bold tabular-nums ${delta >= 0 ? "text-primary" : "text-destructive"}`}>
                {delta >= 0 ? "▲ +" : "▼ "}
                {delta.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
              </span>
            </div>
          )}
        </div>

        {/* linha divisória */}
        <div className="border-t mx-4" />

        {/* detalhes */}
        <div className="px-4 py-2.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Identificados</span>
            <span className="text-xs font-semibold tabular-nums text-foreground">{fmtNum(p.identificados)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total boletos</span>
            <span className="text-xs font-semibold tabular-nums text-foreground">{fmtNum(p.vendas)}</span>
          </div>
        </div>
      </div>
    );
  };
}

// ── Rótulo no gráfico (valor + delta dia anterior) ────────────────────────────
function makeDataLabel(serie: SerieDiaria[]) {
  return function DataLabel({ x, y, value, index }: any) {
    if (value == null) return null;
    const prev = index > 0 ? serie[index - 1]?.taxa ?? null : null;
    const delta = prev !== null ? (value as number) - prev : null;
    const deltaStr = delta !== null
      ? `${delta >= 0 ? "+" : ""}${delta.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
      : null;
    const deltaColor = delta !== null
      ? delta >= 0 ? "var(--color-primary)" : "var(--color-destructive)"
      : "transparent";

    return (
      <g>
        <text x={x} y={y - 20} textAnchor="middle"
          fill="var(--color-foreground)" fontSize={11} fontWeight={600}
          fontFamily="var(--font-sans)">
          {Number(value).toFixed(1)}%
        </text>
        {deltaStr && (
          <text x={x} y={y - 8} textAnchor="middle"
            fill={deltaColor} fontSize={9} fontWeight={700}
            fontFamily="var(--font-sans)">
            {deltaStr}
          </text>
        )}
      </g>
    );
  };
}

// ── Componente principal ──────────────────────────────────────────────────────
export function EvolutionChart({ serie, meta, titulo }: EvolutionChartProps) {
  if (!serie.length) return null;
  const taxaValues = serie.map((s) => s.taxa);
  const min = Math.max(0, Math.floor(Math.min(...taxaValues, meta) - 8));
  const max = Math.ceil(Math.max(...taxaValues, meta) + 18);
  const showLabels = serie.length <= 14;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="rounded-2xl border bg-card p-5 shadow-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">{titulo ?? "Evolução diária"}</h2>
          <p className="text-sm text-muted-foreground">% ID Cliente ao longo do período</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Taxa
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-4 bg-warning" /> Meta {fmtPct(meta, 0)}
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={serie} margin={{ top: 24, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="taxaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="data" tickFormatter={fmtData}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false} axisLine={false} minTickGap={28} />
            <YAxis domain={[min, max]} tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false} axisLine={false} width={44} />
            <Tooltip content={makeTooltip(serie, meta)} cursor={{ stroke: "var(--color-border)", strokeWidth: 1, strokeDasharray: "4 3" }} />
            <ReferenceLine y={meta} stroke="var(--color-warning)" strokeDasharray="5 4" strokeWidth={1.5} />
            <Area type="monotone" dataKey="taxa"
              stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#taxaFill)"
              dot={{ r: 5, fill: "var(--color-primary)", stroke: "var(--color-card)", strokeWidth: 2 }}
              activeDot={{ r: 7, fill: "var(--color-primary)", stroke: "var(--color-card)", strokeWidth: 2 }}>
              {showLabels && <LabelList dataKey="taxa" content={makeDataLabel(serie)} />}
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
