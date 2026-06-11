import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtData, fmtPct, type SerieDiaria } from "@/lib/dashboard-data";

interface EvolutionChartProps {
  serie: SerieDiaria[];
  meta: number;
  titulo?: string;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as SerieDiaria;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-elevated">
      <p className="mb-1 font-semibold text-foreground">{fmtData(label)}</p>
      <p className="font-semibold text-primary">{fmtPct(p.taxa, 1)}</p>
      <p className="text-muted-foreground">
        {p.identificados.toLocaleString("pt-BR")} identificados · {p.vendas.toLocaleString("pt-BR")} boletos
      </p>
    </div>
  );
}

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
        {/* valor principal */}
        <text
          x={x}
          y={y - 20}
          textAnchor="middle"
          fill="var(--color-foreground)"
          fontSize={11}
          fontWeight={600}
          fontFamily="var(--font-sans)"
        >
          {Number(value).toFixed(1)}%
        </text>
        {/* variação dia anterior */}
        {deltaStr && (
          <text
            x={x}
            y={y - 8}
            textAnchor="middle"
            fill={deltaColor}
            fontSize={9}
            fontWeight={700}
            fontFamily="var(--font-sans)"
          >
            {deltaStr}
          </text>
        )}
      </g>
    );
  };
}

export function EvolutionChart({ serie, meta, titulo }: EvolutionChartProps) {
  if (!serie.length) return null;
  const taxaValues = serie.map((s) => s.taxa);
  const min = Math.max(0, Math.floor(Math.min(...taxaValues, meta) - 8));
  const max = Math.ceil(Math.max(...taxaValues, meta) + 18); // espaço para rótulo + variação

  // Mostrar rótulos apenas se poucos pontos (até 14)
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
            <XAxis
              dataKey="data"
              tickFormatter={fmtData}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              domain={[min, max]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine
              y={meta}
              stroke="var(--color-warning)"
              strokeDasharray="5 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="taxa"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              fill="url(#taxaFill)"
              dot={{
                r: 5,
                fill: "var(--color-primary)",
                stroke: "var(--color-card)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: "var(--color-primary)",
                stroke: "var(--color-card)",
                strokeWidth: 2,
              }}
            >
              {showLabels && (
                <LabelList dataKey="taxa" content={makeDataLabel(serie)} />
              )}
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
