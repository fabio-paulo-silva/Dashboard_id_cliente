import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, UserCheck, MapPin, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtPct, fmtNum, type GrupoDispersao, type DispersaoData, type PontoDispersao } from "@/lib/dashboard-data";
import { SortTh } from "./SortTh";

type VisaoType = "consultoresPorLoja" | "lojasPorGestor" | "lojasPorPraca";
type SortKey = "amplitude" | "desvMeta" | "media" | "n" | "grupo";

const VISOES: { id: VisaoType; label: string; icon: React.ElementType; sub: string }[] = [
  { id: "consultoresPorLoja", label: "Consultores por Loja",  icon: Users,      sub: "Variação entre consultores dentro da mesma loja" },
  { id: "lojasPorGestor",    label: "Lojas por Gestor",      icon: UserCheck,  sub: "Variação entre lojas de cada gestor" },
  { id: "lojasPorPraca",     label: "Lojas por Praça",       icon: MapPin,     sub: "Variação entre lojas de cada praça" },
];

interface Props {
  dispersao: DispersaoData;
  meta: number;
}

// ── Dot Strip ─────────────────────────────────────────────────────────────────
function DotStrip({
  pontos,
  meta,
  maxScale,
}: {
  pontos: PontoDispersao[];
  meta: number;
  maxScale: number;
}) {
  const W = 220;
  const H = 22;
  const toX = (v: number) => Math.min(W - 3, Math.max(3, (v / maxScale) * W));
  const metaX = toX(meta);
  const sorted = pontos.map((p) => p.taxa).sort((a, b) => a - b);
  const minX = toX(sorted[0] ?? 0);
  const maxX = toX(sorted[sorted.length - 1] ?? 0);

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible"
      style={{ minWidth: W }}
    >
      {/* Track */}
      <rect x={0} y={9} width={W} height={4} rx={2} fill="var(--color-muted)" opacity={0.5} />
      {/* Range band */}
      <rect
        x={minX}
        y={9}
        width={Math.max(1, maxX - minX)}
        height={4}
        rx={2}
        fill="var(--color-muted-foreground)"
        opacity={0.35}
      />
      {/* Meta line */}
      <line
        x1={metaX} y1={1} x2={metaX} y2={H - 1}
        stroke="var(--color-destructive)"
        strokeWidth={1.5}
        strokeDasharray="3,2"
        opacity={0.7}
      />
      {/* Dots */}
      {pontos.map((p, i) => (
        <circle
          key={i}
          cx={toX(p.taxa)}
          cy={11}
          r={3.5}
          fill={p.taxa >= meta ? "var(--color-primary)" : "var(--color-destructive)"}
          stroke="var(--color-card)"
          strokeWidth={1}
          opacity={0.9}
        >
          <title>{p.nome}: {fmtPct(p.taxa, 1)}</title>
        </circle>
      ))}
    </svg>
  );
}

// ── Expanded row: lista de membros ────────────────────────────────────────────
function MembrosRow({
  pontos,
  meta,
  label,
}: {
  pontos: PontoDispersao[];
  meta: number;
  label: string;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <td colSpan={10} className="bg-muted/30 px-6 pb-4 pt-2">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
        <div className="flex flex-wrap gap-2">
          {[...pontos].sort((a, b) => b.taxa - a.taxa).map((p, i) => {
            const above = p.taxa >= meta;
            const diff = p.taxa - meta;
            return (
              <div
                key={i}
                className={cn(
                  "flex min-w-[200px] flex-1 items-center justify-between rounded-xl border px-3 py-2",
                  above ? "border-primary/20 bg-primary/5" : "border-destructive/20 bg-destructive/5",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtNum(p.identificados)} id. / {fmtNum(p.vendas)} bol.
                  </p>
                </div>
                <div className="ml-3 text-right">
                  <p className={cn("text-sm font-bold tabular-nums", above ? "text-primary" : "text-destructive")}>
                    {fmtPct(p.taxa, 1)}
                  </p>
                  <p className={cn("text-xs tabular-nums", above ? "text-success" : "text-destructive")}>
                    {diff >= 0 ? "+" : ""}{fmtPct(diff, 1)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </td>
    </motion.tr>
  );
}

// ── Ícone de tendência ────────────────────────────────────────────────────────
function AmpIcon({ amplitude }: { amplitude: number }) {
  if (amplitude > 80) return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
  if (amplitude > 40) return <Minus className="h-3.5 w-3.5 text-amber-500" />;
  return <TrendingUp className="h-3.5 w-3.5 text-primary" />;
}

// ── Componente principal ──────────────────────────────────────────────────────
export function DispersaoView({ dispersao, meta }: Props) {
  const [visao, setVisao] = useState<VisaoType>("consultoresPorLoja");
  const [sortKey, setSortKey] = useState<SortKey>("amplitude");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const dados = dispersao[visao];

  const sorted = useMemo(() => {
    return [...dados].sort((a, b) => {
      const v =
        sortKey === "grupo"
          ? a.grupo.localeCompare(b.grupo)
          : (a[sortKey as keyof GrupoDispersao] as number) - (b[sortKey as keyof GrupoDispersao] as number);
      return sortDir === "desc" ? -v : v;
    });
  }, [dados, sortKey, sortDir]);

  // Escala global para o dot strip (igual para todas as linhas)
  const maxScale = useMemo(() => {
    const allTaxas = dados.flatMap((g) => g.pontos.map((p) => p.taxa));
    return Math.max(meta * 2, ...(allTaxas.length > 0 ? [Math.max(...allTaxas) * 1.05] : []));
  }, [dados, meta]);

  // Resumo
  const mediaAmp = dados.length > 0
    ? dados.reduce((s, g) => s + g.amplitude, 0) / dados.length
    : 0;
  const altaDisp = dados.filter((g) => g.amplitude > 50).length;

  const toggle = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const toggleExpand = (grupo: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(grupo) ? next.delete(grupo) : next.add(grupo);
      return next;
    });
  };

  const visaoAtual = VISOES.find((v) => v.id === visao)!;
  const labelMembro = visao === "consultoresPorLoja" ? "Consultores" : "Lojas";

  return (
    <div className="space-y-5">
      {/* Seletor de visão */}
      <div className="rounded-2xl border bg-card p-1.5 shadow-card">
        <div className="flex gap-1 overflow-x-auto">
          {VISOES.map(({ id, label, icon: Icon }) => {
            const active = visao === id;
            return (
              <button
                key={id}
                onClick={() => { setVisao(id); setExpanded(new Set()); }}
                className={cn(
                  "flex flex-1 min-w-max items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap",
                  active
                    ? "bg-secondary text-secondary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-card p-4 shadow-card">
          <p className="text-xs font-semibold text-muted-foreground">Grupos analisados</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">{dados.length}</p>
          <p className="text-xs text-muted-foreground">{visaoAtual.sub}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-card">
          <p className="text-xs font-semibold text-muted-foreground">Amplitude média</p>
          <p className={cn(
            "mt-1 text-2xl font-bold tabular-nums",
            mediaAmp > 80 ? "text-destructive" : mediaAmp > 40 ? "text-amber-500" : "text-primary",
          )}>
            {fmtPct(mediaAmp, 1)} pp
          </p>
          <p className="text-xs text-muted-foreground">diferença max−min</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-card">
          <p className="text-xs font-semibold text-muted-foreground">Alta dispersão (&gt;50 pp)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-destructive">{altaDisp}</p>
          <p className="text-xs text-muted-foreground">
            {dados.length > 0 ? `${Math.round((altaDisp / dados.length) * 100)}% dos grupos` : "—"}
          </p>
        </div>
      </div>

      {/* Tabela */}
      <motion.div
        key={visao}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border bg-card shadow-card"
      >
        <div className="border-b p-5">
          <h2 className="font-display text-lg font-bold text-foreground">
            {visaoAtual.label}
          </h2>
          <p className="text-sm text-muted-foreground">
            {visaoAtual.sub} · ordenar por coluna · clique na linha para ver os membros
          </p>
        </div>

        {/* Legenda da escala */}
        <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-2 text-xs text-muted-foreground">
          <span className="font-semibold">Escala do gráfico:</span>
          <span>0%</span>
          <div className="mx-1 h-0 w-12 border-t border-muted-foreground/40" />
          <span className="font-semibold text-destructive">meta {fmtPct(meta, 0)}</span>
          <div className="mx-1 h-0 w-12 border-t border-muted-foreground/40" />
          <span>{fmtPct(maxScale, 0)}</span>
          <span className="ml-4">●&nbsp;<span className="text-primary">acima da meta</span></span>
          <span className="ml-2">●&nbsp;<span className="text-destructive">abaixo da meta</span></span>
          <span className="ml-2">|&nbsp;<span className="text-destructive/70">linha = meta</span></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b text-left">
                <th className="w-8 px-3 py-3 text-xs text-muted-foreground" />
                <SortTh label="Grupo"      sortKey="grupo"     activeKey={sortKey} dir={sortDir} onSort={toggle} className="px-3" />
                <SortTh label="N"          sortKey="n"         activeKey={sortKey} dir={sortDir} onSort={toggle} className="px-2" />
                <th className="px-3 py-3 text-xs font-semibold text-muted-foreground">
                  Distribuição ({labelMembro})
                </th>
                <SortTh label="Mín"        sortKey="min"       activeKey={sortKey} dir={sortDir} onSort={toggle} className="px-2" />
                <SortTh label="Média"      sortKey="media"     activeKey={sortKey} dir={sortDir} onSort={toggle} className="px-2" />
                <SortTh label="Máx"        sortKey="max"       activeKey={sortKey} dir={sortDir} onSort={toggle} className="px-2" />
                <SortTh label="Amplitude"  sortKey="amplitude" activeKey={sortKey} dir={sortDir} onSort={toggle} className="px-2" />
                <th className="px-3 py-3 text-xs font-semibold text-muted-foreground">
                  Desvio vs Meta
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                  Acima meta
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((g) => {
                const isExp = expanded.has(g.grupo);
                return (
                  <>
                    <tr
                      key={g.grupo}
                      onClick={() => toggleExpand(g.grupo)}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/30"
                    >
                      {/* Expand icon */}
                      <td className="px-3 py-3 text-muted-foreground">
                        {isExp
                          ? <ChevronDown className="h-4 w-4" />
                          : <ChevronRight className="h-4 w-4" />}
                      </td>
                      {/* Grupo */}
                      <td className="max-w-[200px] px-3 py-3">
                        <p className="truncate font-semibold text-foreground">{g.grupo}</p>
                      </td>
                      {/* N */}
                      <td className="px-2 py-3 tabular-nums text-muted-foreground">{g.n}</td>
                      {/* Dot strip */}
                      <td className="px-3 py-3">
                        <DotStrip pontos={g.pontos} meta={meta} maxScale={maxScale} />
                      </td>
                      {/* Min */}
                      <td className="px-2 py-3 tabular-nums text-muted-foreground">
                        {fmtPct(g.min, 1)}
                      </td>
                      {/* Média */}
                      <td className="px-2 py-3">
                        <span className={cn(
                          "font-semibold tabular-nums",
                          g.media >= meta ? "text-primary" : "text-foreground",
                        )}>
                          {fmtPct(g.media, 1)}
                        </span>
                      </td>
                      {/* Max */}
                      <td className="px-2 py-3 tabular-nums text-muted-foreground">
                        {fmtPct(g.max, 1)}
                      </td>
                      {/* Amplitude */}
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1.5">
                          <AmpIcon amplitude={g.amplitude} />
                          <span className={cn(
                            "font-bold tabular-nums",
                            g.amplitude > 80
                              ? "text-destructive"
                              : g.amplitude > 40
                              ? "text-amber-500"
                              : "text-foreground",
                          )}>
                            {fmtPct(g.amplitude, 1)} pp
                          </span>
                        </div>
                      </td>
                      {/* Desvio vs Meta — positivo (acima) e negativo (abaixo) */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          {g.desvAcima !== null ? (
                            <span className="text-xs font-bold tabular-nums text-primary">
                              +{fmtPct(g.desvAcima, 1)} pp
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                          {g.desvAbaixo !== null ? (
                            <span className="text-xs font-bold tabular-nums text-destructive">
                              {fmtPct(g.desvAbaixo, 1)} pp
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </div>
                      </td>
                      {/* Acima meta */}
                      <td className="px-5 py-3 text-right">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                          g.acimaMeta === g.n
                            ? "bg-primary/15 text-primary"
                            : g.acimaMeta === 0
                            ? "bg-destructive/12 text-destructive"
                            : "bg-amber-500/12 text-amber-600",
                        )}>
                          {g.acimaMeta}/{g.n}
                        </span>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {isExp && (
                        <MembrosRow
                          key={`${g.grupo}-exp`}
                          pontos={g.pontos}
                          meta={meta}
                          label={`${labelMembro} em ${g.grupo}`}
                        />
                      )}
                    </AnimatePresence>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
