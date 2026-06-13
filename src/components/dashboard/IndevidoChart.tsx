import { motion } from "motion/react";
import {
  Area, AreaChart, CartesianGrid, LabelList,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { fmtData, fmtNum, fmtPct, type SerieIndevido } from "@/lib/dashboard-data";

interface Props {
  serie: SerieIndevido[];
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as SerieIndevido;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-elevated">
      <p className="mb-1 font-semibold text-foreground">{fmtData(label)}</p>
      <p className="font-semibold text-destructive">{fmtPct(p.taxaIndevido, 2)}</p>
      <p className="text-muted-foreground">
        {fmtNum(p.atendIndevido)} indevidos · {fmtNum(p.totalAtend)} atend. totais
      </p>
    </div>
  );
}

function makeLabel(serie: SerieIndevido[]) {
  return function Label({ x, y, value, index }: any) {
    if (value == null) return null;
    const prev = index > 0 ? serie[index - 1]?.taxaIndevido ?? null : null;
    const delta = prev !== null ? (value as number) - prev : null;
    const deltaStr = delta !== null
      ? `${delta >= 0 ? "+" : ""}${delta.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
      : null;
    // para indevido: subir é ruim (vermelho), cair é bom (verde)
    const deltaColor = delta !== null
      ? delta <= 0 ? "var(--color-primary)" : "var(--color-destructive)"
      : "transparent";

    return (
      <g>
        <text x={x} y={y - 20} textAnchor="middle"
          fill="var(--color-foreground)" fontSize={11} fontWeight={600}
          fontFamily="var(--font-sans)">
          {Number(value).toFixed(2)}%
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

export function IndevidoChart({ serie }: Props) {
  if (!serie.length) return null;
  const showLabels = serie.length <= 14;
  const taxas = serie.map((s) => s.taxaIndevido);
  const min = Math.max(0, Math.floor(Math.min(...taxas) - 2));
  const max = Math.ceil(Math.max(...taxas) + 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="rounded-2xl border bg-card p-5 shadow-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Evolução diária — Uso Indevido</h2>
          <p className="text-sm text-muted-foreground">% de atendimentos indevidos por dia</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive" /> % Indevido
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={serie} margin={{ top: 28, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="invFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="data"
              tickFormatter={fmtData}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false} axisLine={false} minTickGap={28}
            />
            <YAxis
              domain={[min, max]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false} axisLine={false} width={44}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="taxaIndevido"
              stroke="var(--color-destructive)"
              strokeWidth={2.5}
              fill="url(#invFill)"
              dot={{ r: 5, fill: "var(--color-destructive)", stroke: "var(--color-card)", strokeWidth: 2 }}
              activeDot={{ r: 7, fill: "var(--color-destructive)", stroke: "var(--color-card)", strokeWidth: 2 }}
            >
              {showLabels && <LabelList dataKey="taxaIndevido" content={makeLabel(serie)} />}
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
