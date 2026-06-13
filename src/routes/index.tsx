import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Store,
  Users,
  Loader2,
  TriangleAlert,
  LayoutDashboard,
  UserCheck,
  CalendarDays,
  ShieldAlert,
  BadgePercent,
  GitBranch,
} from "lucide-react";

import {
  computar,
  fetchDados,
  fmtNum,
  fmtPct,
  type Filtros,
} from "@/lib/dashboard-data";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { EvolutionChart } from "@/components/dashboard/EvolutionChart";
import { PracaChart } from "@/components/dashboard/PracaChart";
import { RankingTable } from "@/components/dashboard/RankingTable";
import { ConsultorTable } from "@/components/dashboard/ConsultorTable";
import { GestorTable } from "@/components/dashboard/GestorTable";
import { DiaADiaTable } from "@/components/dashboard/DiaADiaTable";
import { UsoIndevidoTable } from "@/components/dashboard/UsoIndevidoTable";
import { DispersaoView } from "@/components/dashboard/DispersaoView";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

type Tab = "geral" | "lojas" | "consultores" | "gestores" | "diaadia" | "dispersao" | "indevido";

const TABS: { id: Tab; label: string; icon: React.ElementType; danger?: boolean }[] = [
  { id: "geral",       label: "Visão Geral",  icon: LayoutDashboard },
  { id: "lojas",       label: "Por Loja",     icon: Store },
  { id: "consultores", label: "Consultores",  icon: Users },
  { id: "gestores",    label: "Gestores",     icon: UserCheck },
  { id: "diaadia",     label: "Dia a Dia",    icon: CalendarDays },
  { id: "dispersao",   label: "Dispersão",    icon: GitBranch },
  { id: "indevido",    label: "Uso Indevido", icon: ShieldAlert, danger: true },
];

function Index() {
  const [tab, setTab] = useState<Tab>("geral");
  const [filtros, setFiltros] = useState<Filtros>({
    praca: "all",
    loja: "all",
    gestor: "all",
    consultor: "all",
    dataInicio: "all",
    dataFim: "all",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dados-consolidados"],
    queryFn: fetchDados,
    staleTime: Infinity,
  });

  const computed = useMemo(
    () => (data ? computar(data, filtros) : null),
    [data, filtros],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
        Carregando indicadores…
      </div>
    );
  }

  if (isError || !data || !computed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <TriangleAlert className="h-10 w-10 text-destructive" />
        <h1 className="font-display text-xl font-bold text-foreground">
          Não foi possível carregar os dados
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Verifique se o arquivo{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">
            data/processed/dados_consolidados.json
          </code>{" "}
          está disponível.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <DashboardHeader
        indicador={data.indicador}
        descricao={data.descricao}
        atualizadoEm={data.atualizadoEm}
      />

      <main className="mx-auto max-w-7xl space-y-5 px-4 pt-5 sm:px-6 lg:px-8">
        <FilterBar dados={data} filtros={filtros} onChange={setFiltros} />

        {/* KPI Cards */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <KpiCard
            index={0}
            label="% ID Cliente"
            value={fmtPct(computed.taxaPeriodo, 1)}
            icon={BadgePercent}
            sub={`Meta ${fmtPct(data.meta, 0)} · ${computed.vsMeta >= 0 ? "+" : ""}${fmtPct(computed.vsMeta, 1)}`}
            tone={computed.taxaPeriodo >= data.meta ? "success" : "default"}
          />
          <KpiCard
            index={1}
            label="Lojas acima da meta"
            value={`${computed.lojasAcimaMeta}/${computed.totalLojas}`}
            icon={Store}
            sub={
              computed.melhorLoja
                ? `Melhor: ${computed.melhorLoja.nome} (${fmtPct(computed.melhorLoja.taxa, 1)})`
                : undefined
            }
            tone="default"
          />
          <KpiCard
            index={2}
            label="Clientes identificados"
            value={fmtNum(computed.totalIdentificados)}
            icon={Users}
            sub={`de ${fmtNum(computed.totalVendas)} boletos`}
            tone="default"
          />
        </section>

        {/* Tabs de navegação destacadas */}
        <nav className="rounded-2xl border bg-card p-1.5 shadow-card">
          <div className="flex overflow-x-auto gap-1">
            {TABS.map(({ id, label, icon: Icon, danger }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex flex-1 min-w-max items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap",
                    active && !danger &&
                      "bg-primary text-primary-foreground shadow-md",
                    active && danger &&
                      "bg-destructive text-destructive-foreground shadow-md",
                    !active && !danger &&
                      "text-muted-foreground hover:bg-muted hover:text-foreground",
                    !active && danger &&
                      "text-destructive/70 hover:bg-destructive/10 hover:text-destructive",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Conteúdo por aba */}
        {tab === "geral" && (
          <section className="space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <EvolutionChart serie={computed.serie} meta={data.meta} />
              <PracaChart pracas={computed.pracas} meta={data.meta} />
            </div>
            <div className="mx-auto max-w-5xl">
              <RankingTable ranking={computed.ranking} meta={data.meta} />
            </div>
          </section>
        )}

        {tab === "lojas" && (
          <RankingTable ranking={computed.ranking} meta={data.meta} />
        )}

        {tab === "consultores" && (
          <ConsultorTable ranking={computed.rankingConsultores} meta={data.meta} />
        )}

        {tab === "gestores" && (
          <section className="space-y-6">
            <GestorTable gestores={computed.gestores} meta={data.meta} />
            <PracaChart pracas={computed.pracas} meta={data.meta} />
          </section>
        )}

        {tab === "diaadia" && (
          <DiaADiaTable
            dias={computed.diasResumo}
            serie={computed.serie}
            meta={data.meta}
            tituloGrafico={
              filtros.consultor !== "all" ? filtros.consultor
              : filtros.loja !== "all" ? data.lojas.find((l) => l.id === filtros.loja)?.nome
              : filtros.gestor !== "all" ? filtros.gestor
              : filtros.praca !== "all" ? filtros.praca
              : undefined
            }
          />
        )}

        {tab === "dispersao" && (
          <DispersaoView dispersao={computed.dispersao} meta={data.meta} />
        )}

        {tab === "indevido" && (
          <UsoIndevidoTable
            lojas={computed.rankingIndevido}
            consultores={computed.rankingConsultorIndevido}
            totalAtend={computed.totalAtendIndevido}
            lojasComIndevido={computed.lojasComIndevido}
            totalLojas={computed.totalLojas}
            serieIndevido={computed.serieIndevido}
          />
        )}
      </main>
    </div>
  );
}
