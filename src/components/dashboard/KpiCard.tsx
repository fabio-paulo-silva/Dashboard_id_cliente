import { motion } from "motion/react";
import { type LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  sub?: string;
  delta?: number; // pontos percentuais
  deltaSuffix?: string;
  tone?: "default" | "success" | "warning" | "destructive";
  index?: number;
}

const toneRing: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/15",
  destructive: "text-destructive bg-destructive/10",
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  sub,
  delta,
  deltaSuffix = "p.p.",
  tone = "default",
  index = 0,
}: KpiCardProps) {
  const hasDelta = typeof delta === "number";
  const up = (delta ?? 0) > 0.05;
  const down = (delta ?? 0) < -0.05;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-foreground">
            {value}
          </p>
        </div>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneRing[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {hasDelta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              up && "bg-success/12 text-success",
              down && "bg-destructive/12 text-destructive",
              !up && !down && "bg-muted text-muted-foreground",
            )}
          >
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : down ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            {`${delta! > 0 ? "+" : ""}${delta!.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${deltaSuffix}`}
          </span>
        )}
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </motion.div>
  );
}
