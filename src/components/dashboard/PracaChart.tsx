import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtPct, type PracaResumo } from "@/lib/dashboard-data";

interface PracaChartProps {
  pracas: PracaResumo[];
  meta: number;
}

function PTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as PracaResumo;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-elevated">
      <p className="font-semibold text-foreground">{p.praca}</p>
      <p className="text-primary font-semibold">{fmtPct(p.taxa, 1)}</p>
      <p className="text-muted-foreground">{p.vendas.toLocaleString("pt-BR")} vendas</p>
    </div>
  );
}

export function PracaChart({ pracas, meta }: PracaChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.16 }}
      className="rounded-2xl border bg-card p-5 shadow-card"
    >
      <div className="mb-4">
        <h2 className="font-display text-lg font-bold text-foreground">Comparativo por praça</h2>
        <p className="text-sm text-muted-foreground">Taxa média de identificação no período</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pracas} margin={{ top: 18, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="praca"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} content={<PTooltip />} />
            <ReferenceLine y={meta} stroke="var(--color-warning)" strokeDasharray="5 4" strokeWidth={1.5} />
            <Bar dataKey="taxa" radius={[6, 6, 0, 0]} maxBarSize={64}>
              {pracas.map((p) => (
                <Cell
                  key={p.praca}
                  fill={p.taxa >= meta ? "var(--color-success)" : "var(--color-primary)"}
                />
              ))}
              <LabelList
                dataKey="taxa"
                position="top"
                formatter={(v: number) => `${v.toFixed(0)}%`}
                style={{ fontSize: 11, fontWeight: 700, fill: "var(--color-foreground)" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
