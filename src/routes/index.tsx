import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Target,
  Percent,
  Store,
  Users,
  Loader2,
  TriangleAlert,
  LayoutDashboard,
  MapPin,
  UserCheck,
  CalendarDays,
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

type Tab = "geral" | "lojas" | "consultores" | "gestores" | "diaadia";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "geral", label: "Visão Geral", icon: LayoutDashboard },
  { id: "lojas", label: "Por Loja", icon: Store },
  { id: "consultores", label: "Consultores", icon: Users },
  { id: "gestores", label: "Gestores", icon: UserCheck },
  { id: "diaadia", label: "Dia a Dia", icon: CalendarDays },
];

function Index() {
  const [tab, setTab] = useState<Tab>("geral");
  const [filtros, setFiltros] = useState<Filtros>({
    dias: 30,
    praca: "all",
    loja: "all",
    gestor: "all",
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

  const atingimento = (computed.taxaPeriodo / data.meta) * 100;

  return (
    <div className="min-h-screen bg-background pb-16">
      <DashboardHeader
        indicador={data.indicador}
        descricao={data.descricao}
        atualizadoEm={data.atualizadoEm}
      />

      <main className="mx-auto max-w-7xl space-y-5 px-4 pt-5 sm:px-6 lg:px-8">
        <FilterBar dados={data} filtros={filtros} onChange={setFiltros} />

        {/* KPI Cards — sempre visíveis */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            index={0}
            label="Taxa de identificação"
            value={fmtPct(computed.taxaPeriodo, 1)}
            icon={Percent}
            delta={computed.variacaoPp}
            sub="vs. período anterior"
            tone={computed.taxaPeriodo >= data.meta ? "success" : "default"}
          />
          <KpiCard
            index={1}
            label="Atingimento da meta"
            value={fmtPct(atingimento, 0)}
            icon={Target}
            sub={`Meta ${fmtPct(data.meta, 0)} · ${computed.vsMeta >= 0 ? "+" : ""}${computed.vsMeta.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} p.p.`}
            tone={computed.vsMeta >= 0 ? "success" : "destructive"}
          />
          <KpiCard
            index={2}
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
            index={3}
            label="Clientes identificados"
            value={fmtNum(computed.totalIdentificados)}
            icon={Users}
            sub={`de ${fmtNum(computed.totalVendas)} boletos`}
            tone="default"
          />
        </section>

        {/* Tabs de navegação */}
        <nav className="flex gap-1 overflow-x-auto rounded-xl border bg-muted/30 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex flex-1 min-w-max items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                tab === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Conteúdo por aba */}
        {tab === "geral" && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <EvolutionChart serie={computed.serie} meta={data.meta} />
              </div>
              <div className="lg:col-span-2">
                <PracaChart pracas={computed.pracas} meta={data.meta} />
              </div>
            </div>
            <RankingTable ranking={computed.ranking.slice(0, 10)} meta={data.meta} />
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
          <section className="space-y-6">
            <EvolutionChart serie={computed.serie} meta={data.meta} />
            <DiaADiaTable dias={computed.diasResumo} meta={data.meta} />
          </section>
        )}
      </main>
    </div>
  );
}
