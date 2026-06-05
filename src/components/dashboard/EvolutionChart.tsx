import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
      <p className="text-primary font-semibold">{fmtPct(p.taxa, 1)} identificados</p>
      <p className="text-muted-foreground">
        {p.identificados.toLocaleString("pt-BR")} de {p.vendas.toLocaleString("pt-BR")} vendas
      </p>
    </div>
  );
}

export function EvolutionChart({ serie, meta, titulo }: EvolutionChartProps) {
  const taxaValues = serie.map((s) => s.taxa);
  const min = Math.max(0, Math.floor(Math.min(...taxaValues, meta) - 6));
  const max = Math.ceil(Math.max(...taxaValues, meta) + 4);

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
          <AreaChart data={serie} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="taxaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
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
            <ReferenceLine y={meta} stroke="var(--color-warning)" strokeDasharray="5 4" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="taxa"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              fill="url(#taxaFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-card)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
