import { motion } from "motion/react";
import {
  Area, AreaChart, CartesianGrid, LabelList,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { fmtData, fmtNum, fmtPct, type SerieIndevido } from "@/lib/dashboard-data";

interface Props {
  serie: SerieIndevido[];
}

// ── Tooltip rico ──────────────────────────────────────────────────────────────
function makeTooltip(serie: SerieIndevido[]) {
  return function ChartTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload as SerieIndevido;
    const idx = serie.findIndex((s) => s.data === p.data);
    const prev = idx > 0 ? serie[idx - 1] : null;
    const delta = prev != null ? p.taxaIndevido - prev.taxaIndevido : null;
    const pct = p.totalAtend > 0 ? (p.atendIndevido / p.totalAtend) * 100 : 0;

    return (
      <div className="min-w-[210px] rounded-xl border bg-popover shadow-elevated overflow-hidden">
        {/* cabeçalho */}
        <div className="border-b bg-destructive/8 px-4 py-2.5">
          <p className="text-xs font-bold text-foreground">{fmtData(p.data)}</p>
        </div>

        {/* métrica principal */}
        <div className="px-4 py-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-xs text-muted-foreground">% Uso Indevido</span>
            <span className="text-xl font-bold tabular-nums text-destructive">
              {fmtPct(pct, 2)}
            </span>
          </div>

          {/* vs dia anterior */}
          {delta !== null && (
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">vs dia anterior</span>
              <span className={`text-xs font-bold tabular-nums ${delta <= 0 ? "text-primary" : "text-destructive"}`}>
                {delta > 0 ? "▲ +" : delta < 0 ? "▼ " : ""}
                {delta.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </span>
            </div>
          )}
        </div>

        {/* linha divisória */}
        <div className="border-t mx-4" />

        {/* detalhes */}
        <div className="px-4 py-2.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Atend. indevidos</span>
            <span className="text-xs font-semibold tabular-nums text-destructive">{fmtNum(p.atendIndevido)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total atendimentos</span>
            <span className="text-xs font-semibold tabular-nums text-foreground">{fmtNum(p.totalAtend)}</span>
          </div>
        </div>
      </div>
    );
  };
}

// ── Rótulo no gráfico — apenas valor, sem delta ───────────────────────────────
function SimpleLabel({ x, y, value }: any) {
  if (value == null) return null;
  return (
    <text x={x} y={y - 12} textAnchor="middle"
      fill="var(--color-foreground)" fontSize={11} fontWeight={600}
      fontFamily="var(--font-sans)">
      {Number(value).toFixed(2)}%
    </text>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function IndevidoChart({ serie }: Props) {
  if (!serie.length) return null;
  const showLabels = serie.length <= 14;
  const taxas = serie.map((s) => s.taxaIndevido);
  const min = Math.max(0, Math.floor(Math.min(...taxas) - 2));
  const max = Math.ceil(Math.max(...taxas) + 5);

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
          <AreaChart data={serie} margin={{ top: 22, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="invFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="data" tickFormatter={fmtData}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false} axisLine={false} minTickGap={28} />
            <YAxis domain={[min, max]} tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false} axisLine={false} width={44} />
            <Tooltip content={makeTooltip(serie)} cursor={{ stroke: "var(--color-border)", strokeWidth: 1, strokeDasharray: "4 3" }} />
            <Area type="monotone" dataKey="taxaIndevido"
              stroke="var(--color-destructive)" strokeWidth={2.5} fill="url(#invFill)"
              dot={{ r: 5, fill: "var(--color-destructive)", stroke: "var(--color-card)", strokeWidth: 2 }}
              activeDot={{ r: 7, fill: "var(--color-destructive)", stroke: "var(--color-card)", strokeWidth: 2 }}>
              {showLabels && <LabelList dataKey="taxaIndevido" content={<SimpleLabel />} />}
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
