export interface Loja {
  id: string;
  nome: string;
  praca: string;
  gestor: string;
  gcvo: string;
  grvo: string;
  regional: string;
  cluster: string;
  categoria: string;
}

export interface Registro {
  data: string;
  lojaId: string;
  vendas: number;
  identificados: number;
  atendId: number;
  taxa: number;
  atendIndevido: number;
  boletosIndevido: number;
  taxaIndevido: number;
}

export interface RegistroConsultor {
  data: string;
  lojaId: string;
  consultor: string;
  vendas: number;
  identificados: number;
  atendId: number;
  taxa: number;
  atendIndevido: number;
  boletosIndevido: number;
  taxaIndevido: number;
}

export interface DadosConsolidados {
  indicador: string;
  descricao: string;
  unidade: string;
  meta: number;
  periodo: { inicio: string; fim: string };
  atualizadoEm: string;
  pracas: string[];
  gestores: string[];
  consultores: string[];
  lojas: Loja[];
  registros: Registro[];
  registrosConsultor: RegistroConsultor[];
}

export interface Filtros {
  dias: number | "all";
  praca: string;
  loja: string;
  gestor: string;
}

export interface SerieDiaria {
  data: string;
  vendas: number;
  identificados: number;
  taxa: number;
}

export interface RankingLoja {
  id: string;
  nome: string;
  praca: string;
  gestor: string;
  vendas: number;
  identificados: number;
  taxa: number;
  vsMeta: number;
  atendIndevido: number;
  taxaIndevido: number;
}

export interface RankingConsultor {
  consultor: string;
  lojaId: string;
  lojaNome: string;
  praca: string;
  gestor: string;
  vendas: number;
  identificados: number;
  taxa: number;
  vsMeta: number;
  atendIndevido: number;
  taxaIndevido: number;
}

export interface RankingIndevido {
  id: string;
  nome: string;
  praca: string;
  gestor: string;
  atendIndevido: number;
  boletosIndevido: number;
  taxaIndevido: number;
  totalAtend: number;
}

export interface RankingConsultorIndevido {
  consultor: string;
  lojaNome: string;
  praca: string;
  atendIndevido: number;
  taxaIndevido: number;
  totalAtend: number;
}

export interface PracaResumo {
  praca: string;
  taxa: number;
  vendas: number;
  identificados: number;
  lojas: number;
  gestores: string[];
}

export interface GestorResumo {
  gestor: string;
  taxa: number;
  vendas: number;
  identificados: number;
  lojas: number;
  praca: string;
}

export interface DiaResumo {
  data: string;
  vendas: number;
  identificados: number;
  taxa: number;
  lojas: number;
}

const BASE = import.meta.env.BASE_URL ?? "/";

export async function fetchDados(): Promise<DadosConsolidados> {
  const url = `${BASE}data/processed/dados_consolidados.json`.replace(/\/\//g, "/");
  const res = await fetch(url);
  if (!res.ok) throw new Error("Não foi possível carregar os dados consolidados.");
  return res.json();
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function lojasFiltradas(dados: DadosConsolidados, f: Filtros): Loja[] {
  return dados.lojas.filter((l) => {
    if (f.praca !== "all" && l.praca !== f.praca) return false;
    if (f.gestor !== "all" && l.gestor !== f.gestor) return false;
    if (f.loja !== "all" && l.id !== f.loja) return false;
    return true;
  });
}

function windowStart(dados: DadosConsolidados, f: Filtros): string {
  if (f.dias === "all") return dados.periodo.inicio;
  return addDays(dados.periodo.fim, -(f.dias - 1));
}

function registrosNoIntervalo(
  registros: Registro[],
  ids: Set<string>,
  inicio: string,
  fim: string,
): Registro[] {
  return registros.filter(
    (r) => ids.has(r.lojaId) && r.data >= inicio && r.data <= fim,
  );
}

function taxaPonderada(regs: Registro[]): number {
  const v = regs.reduce((s, r) => s + r.vendas, 0);
  const i = regs.reduce((s, r) => s + r.identificados, 0);
  return v === 0 ? 0 : (i / v) * 100;
}

export interface DashboardComputed {
  serie: SerieDiaria[];
  taxaPeriodo: number;
  variacaoPp: number;
  totalVendas: number;
  totalIdentificados: number;
  vsMeta: number;
  lojasAcimaMeta: number;
  totalLojas: number;
  ranking: RankingLoja[];
  rankingConsultores: RankingConsultor[];
  pracas: PracaResumo[];
  gestores: GestorResumo[];
  diasResumo: DiaResumo[];
  rankingIndevido: RankingIndevido[];
  rankingConsultorIndevido: RankingConsultorIndevido[];
  totalAtendIndevido: number;
  lojasComIndevido: number;
  melhorLoja?: RankingLoja;
  piorLoja?: RankingLoja;
}

export function computar(dados: DadosConsolidados, f: Filtros): DashboardComputed {
  const lojas = lojasFiltradas(dados, f);
  const ids = new Set(lojas.map((l) => l.id));
  const inicio = windowStart(dados, f);
  const fim = dados.periodo.fim;

  const regs = registrosNoIntervalo(dados.registros, ids, inicio, fim);

  // série diária
  const map = new Map<string, { vendas: number; identificados: number }>();
  for (const r of regs) {
    const cur = map.get(r.data) ?? { vendas: 0, identificados: 0 };
    cur.vendas += r.vendas;
    cur.identificados += r.identificados;
    map.set(r.data, cur);
  }
  const serie: SerieDiaria[] = [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([data, v]) => ({
      data,
      vendas: v.vendas,
      identificados: v.identificados,
      taxa: v.vendas === 0 ? 0 : Number(((v.identificados / v.vendas) * 100).toFixed(2)),
    }));

  const totalVendas = regs.reduce((s, r) => s + r.vendas, 0);
  const totalIdentificados = regs.reduce((s, r) => s + r.identificados, 0);
  const taxaPeriodo = taxaPonderada(regs);

  // variação vs período anterior
  let variacaoPp = 0;
  if (f.dias !== "all") {
    const prevFim = addDays(inicio, -1);
    const prevInicio = addDays(prevFim, -(f.dias - 1));
    const prevRegs = registrosNoIntervalo(dados.registros, ids, prevInicio, prevFim);
    if (prevRegs.length) variacaoPp = taxaPeriodo - taxaPonderada(prevRegs);
  } else if (serie.length > 1) {
    const half = Math.floor(serie.length / 2);
    const first = serie.slice(0, half);
    const second = serie.slice(half);
    const avg = (s: SerieDiaria[]) =>
      s.reduce((a, b) => a + b.taxa, 0) / Math.max(1, s.length);
    variacaoPp = avg(second) - avg(first);
  }

  // ranking por loja
  const ranking: RankingLoja[] = lojas
    .map((l) => {
      const lr = regs.filter((r) => r.lojaId === l.id);
      const vendas = lr.reduce((s, r) => s + r.vendas, 0);
      const identificados = lr.reduce((s, r) => s + r.identificados, 0);
      const taxa = vendas === 0 ? 0 : (identificados / vendas) * 100;
      const atendIndevido = lr.reduce((s, r) => s + (r.atendIndevido ?? 0), 0);
      const atendTotal = lr.reduce((s, r) => s + r.atendId, 0);
      const taxaIndevido = atendTotal === 0 ? 0 : (atendIndevido / atendTotal) * 100;
      return {
        id: l.id,
        nome: l.nome,
        praca: l.praca,
        gestor: l.gestor,
        vendas,
        identificados,
        taxa,
        vsMeta: taxa - dados.meta,
        atendIndevido,
        taxaIndevido,
      };
    })
    .filter((r) => r.vendas > 0)
    .sort((a, b) => b.taxa - a.taxa);

  // ranking por consultor
  const regsConsultor = (dados.registrosConsultor ?? []).filter(
    (r) => ids.has(r.lojaId) && r.data >= inicio && r.data <= fim,
  );
  const consMapFull = new Map<string, { vendas: number; identificados: number; lojaId: string; atendIndevido: number; atendId: number }>();
  for (const r of regsConsultor) {
    const key = `${r.consultor}::${r.lojaId}`;
    const cur = consMapFull.get(key) ?? { vendas: 0, identificados: 0, lojaId: r.lojaId, atendIndevido: 0, atendId: 0 };
    cur.vendas += r.vendas;
    cur.identificados += r.identificados;
    cur.atendIndevido += r.atendIndevido ?? 0;
    cur.atendId += r.atendId;
    consMapFull.set(key, cur);
  }
  const rankingConsultores: RankingConsultor[] = [...consMapFull.entries()]
    .map(([key, v]) => {
      const [consultor] = key.split("::");
      const loja = dados.lojas.find((l) => l.id === v.lojaId);
      const taxa = v.vendas === 0 ? 0 : (v.identificados / v.vendas) * 100;
      const taxaIndevido = v.atendId === 0 ? 0 : (v.atendIndevido / v.atendId) * 100;
      return {
        consultor,
        lojaId: v.lojaId,
        lojaNome: loja?.nome ?? v.lojaId,
        praca: loja?.praca ?? "",
        gestor: loja?.gestor ?? "",
        vendas: v.vendas,
        identificados: v.identificados,
        taxa,
        vsMeta: taxa - dados.meta,
        atendIndevido: v.atendIndevido,
        taxaIndevido,
      };
    })
    .filter((r) => r.vendas > 0)
    .sort((a, b) => b.taxa - a.taxa);

  // por praça
  const pmap = new Map<string, { vendas: number; identificados: number; lojasSet: Set<string>; gestoresSet: Set<string> }>();
  for (const r of regs) {
    const loja = dados.lojas.find((l) => l.id === r.lojaId);
    if (!loja) continue;
    const cur = pmap.get(loja.praca) ?? { vendas: 0, identificados: 0, lojasSet: new Set(), gestoresSet: new Set() };
    cur.vendas += r.vendas;
    cur.identificados += r.identificados;
    cur.lojasSet.add(r.lojaId);
    cur.gestoresSet.add(loja.gestor);
    pmap.set(loja.praca, cur);
  }
  const pracas: PracaResumo[] = [...pmap.entries()]
    .map(([praca, v]) => ({
      praca,
      vendas: v.vendas,
      identificados: v.identificados,
      taxa: v.vendas === 0 ? 0 : (v.identificados / v.vendas) * 100,
      lojas: v.lojasSet.size,
      gestores: [...v.gestoresSet],
    }))
    .sort((a, b) => b.taxa - a.taxa);

  // por gestor
  const gmap = new Map<string, { vendas: number; identificados: number; lojasSet: Set<string>; praca: string }>();
  for (const r of regs) {
    const loja = dados.lojas.find((l) => l.id === r.lojaId);
    if (!loja) continue;
    const cur = gmap.get(loja.gestor) ?? { vendas: 0, identificados: 0, lojasSet: new Set(), praca: loja.praca };
    cur.vendas += r.vendas;
    cur.identificados += r.identificados;
    cur.lojasSet.add(r.lojaId);
    gmap.set(loja.gestor, cur);
  }
  const gestores: GestorResumo[] = [...gmap.entries()]
    .map(([gestor, v]) => ({
      gestor,
      vendas: v.vendas,
      identificados: v.identificados,
      taxa: v.vendas === 0 ? 0 : (v.identificados / v.vendas) * 100,
      lojas: v.lojasSet.size,
      praca: v.praca,
    }))
    .sort((a, b) => b.taxa - a.taxa);

  // dia a dia resumo
  const diasResumo: DiaResumo[] = serie.map((s) => {
    const diasRegs = regs.filter((r) => r.data === s.data);
    return {
      data: s.data,
      vendas: s.vendas,
      identificados: s.identificados,
      taxa: s.taxa,
      lojas: new Set(diasRegs.map((r) => r.lojaId)).size,
    };
  });

  // ranking uso indevido por loja (maior % indevido primeiro)
  const rankingIndevido: RankingIndevido[] = lojas
    .map((l) => {
      const lr = regs.filter((r) => r.lojaId === l.id);
      const atendIndevido = lr.reduce((s, r) => s + (r.atendIndevido ?? 0), 0);
      const boletosIndevido = lr.reduce((s, r) => s + (r.boletosIndevido ?? 0), 0);
      const totalAtend = lr.reduce((s, r) => s + r.atendId, 0);
      const taxaIndevido = totalAtend === 0 ? 0 : (atendIndevido / totalAtend) * 100;
      return { id: l.id, nome: l.nome, praca: l.praca, gestor: l.gestor, atendIndevido, boletosIndevido, taxaIndevido, totalAtend };
    })
    .filter((r) => r.atendIndevido > 0)
    .sort((a, b) => b.taxaIndevido - a.taxaIndevido);

  // ranking uso indevido por consultor
  const rankingConsultorIndevido: RankingConsultorIndevido[] = [...consMapFull.entries()]
    .map(([key, v]) => {
      const [consultor] = key.split("::");
      const loja = dados.lojas.find((l) => l.id === v.lojaId);
      const taxaIndevido = v.atendId === 0 ? 0 : (v.atendIndevido / v.atendId) * 100;
      return { consultor, lojaNome: loja?.nome ?? v.lojaId, praca: loja?.praca ?? "", atendIndevido: v.atendIndevido, taxaIndevido, totalAtend: v.atendId };
    })
    .filter((r) => r.atendIndevido > 0)
    .sort((a, b) => b.taxaIndevido - a.taxaIndevido);

  const totalAtendIndevido = regs.reduce((s, r) => s + (r.atendIndevido ?? 0), 0);

  return {
    serie,
    taxaPeriodo,
    variacaoPp,
    totalVendas,
    totalIdentificados,
    vsMeta: taxaPeriodo - dados.meta,
    lojasAcimaMeta: ranking.filter((r) => r.taxa >= dados.meta).length,
    totalLojas: ranking.length,
    ranking,
    rankingConsultores,
    pracas,
    gestores,
    diasResumo,
    rankingIndevido,
    rankingConsultorIndevido,
    totalAtendIndevido,
    lojasComIndevido: rankingIndevido.length,
    melhorLoja: ranking[0],
    piorLoja: ranking[ranking.length - 1],
  };
}

export const fmtPct = (n: number, d = 1) =>
  `${n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d })}%`;

export const fmtNum = (n: number) => n.toLocaleString("pt-BR");

export const fmtData = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};
