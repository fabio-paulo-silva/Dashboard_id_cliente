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
  praca: string;
  loja: string;
  gestor: string;
  consultor: string; // "all" ou nome do consultor
  dataInicio: string;
  dataFim: string;
}

export interface SerieDiaria {
  data: string;
  vendas: number;
  identificados: number;
  taxa: number;
}

export interface SerieIndevido {
  data: string;
  atendIndevido: number;
  totalAtend: number;
  taxaIndevido: number;
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
  lojas: string[];   // nomes das lojas onde o consultor atua
  pracas: string[];
  nLojas: number;
  vendas: number;
  identificados: number;
  atendIndevido: number;
  taxa: number;
  taxaIndevido: number;
  vsMeta: number;
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
  lojas: string[];
  nLojas: number;
  atendIndevido: number;
  taxaIndevido: number;
  totalAtend: number;
}

// ─── Dispersão ────────────────────────────────────────────────────────────────
export interface PontoDispersao {
  nome: string;
  /** % ID Cliente = identificados / vendas × 100  (identificados = cpf_bruto − indevidos) */
  taxa: number;
  vendas: number;
  identificados: number;
}

export interface GrupoDispersao {
  grupo: string;
  pontos: PontoDispersao[];  // sorted by taxa asc
  n: number;
  min: number;
  max: number;
  media: number;
  mediana: number;
  amplitude: number;
  /** Dist. média absoluta vs META: mean(|taxa_i − meta|) */
  desvMeta: number;
  /** Média de (taxa_i − meta) apenas para membros ACIMA da meta — positivo */
  desvAcima: number | null;
  /** Média de (taxa_i − meta) apenas para membros ABAIXO da meta — negativo */
  desvAbaixo: number | null;
  acimaMeta: number;
}

export interface DispersaoData {
  consultoresPorLoja: GrupoDispersao[];
  lojasPorGestor: GrupoDispersao[];
  lojasPorPraca: GrupoDispersao[];
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
  dispersao: DispersaoData;
  serieIndevido: SerieIndevido[];
}

// ─── Helper: estatísticas de dispersão ────────────────────────────────────────
function calcStats(pontos: PontoDispersao[], meta: number): Omit<GrupoDispersao, "grupo" | "pontos"> {
  const taxas = pontos.map((p) => p.taxa).sort((a, b) => a - b);
  const n = taxas.length;
  const min = taxas[0] ?? 0;
  const max = taxas[n - 1] ?? 0;
  const media = taxas.reduce((s, t) => s + t, 0) / (n || 1);
  const mid = Math.floor(n / 2);
  const mediana = n % 2 === 0 ? (taxas[mid - 1] + taxas[mid]) / 2 : taxas[mid];
  const amplitude = max - min;
  // Dist. média absoluta vs META
  const desvMeta = taxas.reduce((s, t) => s + Math.abs(t - meta), 0) / (n || 1);
  const acimaMeta = taxas.filter((t) => t >= meta).length;
  // Média signed: só quem está ACIMA (+) e só quem está ABAIXO (-)
  const taxasAcima = taxas.filter((t) => t >= meta);
  const taxasAbaixo = taxas.filter((t) => t < meta);
  const desvAcima = taxasAcima.length > 0
    ? taxasAcima.reduce((s, t) => s + (t - meta), 0) / taxasAcima.length
    : null;
  const desvAbaixo = taxasAbaixo.length > 0
    ? taxasAbaixo.reduce((s, t) => s + (t - meta), 0) / taxasAbaixo.length
    : null;
  return { n, min, max, media, mediana, amplitude, desvMeta, desvAcima, desvAbaixo, acimaMeta };
}

export function computar(dados: DadosConsolidados, f: Filtros): DashboardComputed {
  const lojas = lojasFiltradas(dados, f);
  const ids = new Set(lojas.map((l) => l.id));
  const inicio = f.dataInicio !== "all" ? f.dataInicio : dados.periodo.inicio;
  const fim = f.dataFim !== "all" ? f.dataFim : dados.periodo.fim;

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

  const variacaoPp = 0;

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
  const regsConsultorBase = (dados.registrosConsultor ?? []).filter(
    (r) => ids.has(r.lojaId) && r.data >= inicio && r.data <= fim,
  );
  const regsConsultor = f.consultor !== "all"
    ? regsConsultorBase.filter((r) => r.consultor === f.consultor)
    : regsConsultorBase;
  // Agrupar por consultor (pode atuar em várias lojas — soma tudo)
  const consMapFull = new Map<string, {
    vendas: number; identificados: number; atendIndevido: number; atendId: number;
    lojasSet: Set<string>;
  }>();
  for (const r of regsConsultor) {
    const cur = consMapFull.get(r.consultor) ?? {
      vendas: 0, identificados: 0, atendIndevido: 0, atendId: 0, lojasSet: new Set<string>(),
    };
    cur.vendas += r.vendas;
    cur.identificados += r.identificados;
    cur.atendIndevido += r.atendIndevido ?? 0;
    cur.atendId += r.atendId;
    cur.lojasSet.add(r.lojaId);
    consMapFull.set(r.consultor, cur);
  }
  const rankingConsultores: RankingConsultor[] = [...consMapFull.entries()]
    .map(([consultor, v]) => {
      const lojasNomes = [...v.lojasSet]
        .map((id) => dados.lojas.find((l) => l.id === id)?.nome ?? id)
        .sort();
      const pracas = [...new Set([...v.lojasSet].map((id) => dados.lojas.find((l) => l.id === id)?.praca ?? ""))].filter(Boolean);
      const taxa = v.vendas === 0 ? 0 : (v.identificados / v.vendas) * 100;
      const taxaIndevido = v.atendId === 0 ? 0 : (v.atendIndevido / v.atendId) * 100;
      return {
        consultor,
        lojas: lojasNomes,
        pracas,
        nLojas: v.lojasSet.size,
        vendas: v.vendas,
        identificados: v.identificados,
        atendIndevido: v.atendIndevido,
        taxa,
        taxaIndevido,
        vsMeta: taxa - dados.meta,
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

  // dia a dia resumo — usa dados de consultor se filtrado por ele
  const diasResumo: DiaResumo[] = (() => {
    const fonte = f.consultor !== "all" ? regsConsultor : regs;
    const dmap = new Map<string, { vendas: number; identificados: number; entidades: Set<string> }>();
    for (const r of fonte) {
      const cur = dmap.get(r.data) ?? { vendas: 0, identificados: 0, entidades: new Set() };
      cur.vendas += r.vendas;
      cur.identificados += r.identificados;
      cur.entidades.add(f.consultor !== "all" ? (r as any).consultor ?? r.lojaId : r.lojaId);
      dmap.set(r.data, cur);
    }
    return [...dmap.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([data, v]) => ({
        data,
        vendas: v.vendas,
        identificados: v.identificados,
        taxa: v.vendas === 0 ? 0 : Number(((v.identificados / v.vendas) * 100).toFixed(2)),
        lojas: v.entidades.size,
      }));
  })();

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

  // ranking uso indevido por consultor (já agrupado por nome acima)
  const rankingConsultorIndevido: RankingConsultorIndevido[] = [...consMapFull.entries()]
    .map(([consultor, v]) => {
      const lojasNomes = [...v.lojasSet].map((id) => dados.lojas.find((l) => l.id === id)?.nome ?? id).sort();
      const taxaIndevido = v.atendId === 0 ? 0 : (v.atendIndevido / v.atendId) * 100;
      return { consultor, lojas: lojasNomes, nLojas: v.lojasSet.size, atendIndevido: v.atendIndevido, taxaIndevido, totalAtend: v.atendId };
    })
    .filter((r) => r.atendIndevido > 0)
    .sort((a, b) => b.taxaIndevido - a.taxaIndevido);

  const totalAtendIndevido = regs.reduce((s, r) => s + (r.atendIndevido ?? 0), 0);

  // Série diária de uso indevido
  const invDayMap = new Map<string, { atendIndevido: number; totalAtend: number }>();
  for (const r of regs) {
    const cur = invDayMap.get(r.data) ?? { atendIndevido: 0, totalAtend: 0 };
    cur.atendIndevido += r.atendIndevido ?? 0;
    cur.totalAtend += r.atendId;
    invDayMap.set(r.data, cur);
  }
  const serieIndevido: SerieIndevido[] = [...invDayMap.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([data, v]) => ({
      data,
      atendIndevido: v.atendIndevido,
      totalAtend: v.totalAtend,
      taxaIndevido: v.totalAtend === 0 ? 0 : Number(((v.atendIndevido / v.totalAtend) * 100).toFixed(2)),
    }));

  // ─── Dispersão ────────────────────────────────────────────────────────────
  // FORMULA: taxa = identificados / vendas × 100
  //          identificados já vem do Python como (cpf_bruto − indevidos)

  // 1) Consultores por loja — per-loja taxa (não multi-loja agregada)
  const lojaConsMap = new Map<string, Map<string, { identificados: number; vendas: number }>>();
  for (const r of regsConsultorBase) {
    if (!lojaConsMap.has(r.lojaId)) lojaConsMap.set(r.lojaId, new Map());
    const cm = lojaConsMap.get(r.lojaId)!;
    const cur = cm.get(r.consultor) ?? { identificados: 0, vendas: 0 };
    cur.identificados += r.identificados;
    cur.vendas += r.vendas;
    cm.set(r.consultor, cur);
  }
  const consultoresPorLoja: GrupoDispersao[] = [];
  for (const [lojaId, cm] of lojaConsMap) {
    const loja = dados.lojas.find((l) => l.id === lojaId);
    if (!loja) continue;
    const pontos: PontoDispersao[] = [...cm.entries()]
      .filter(([, v]) => v.vendas > 0)
      .map(([nome, v]) => ({
        nome,
        taxa: (v.identificados / v.vendas) * 100,
        vendas: v.vendas,
        identificados: v.identificados,
      }))
      .filter((p) => p.taxa > 0)  // exclui consultores com 0% ID Cliente
      .sort((a, b) => a.taxa - b.taxa);
    if (pontos.length < 2) continue;
    consultoresPorLoja.push({ grupo: loja.nome, pontos, ...calcStats(pontos, dados.meta) });
  }
  consultoresPorLoja.sort((a, b) => b.amplitude - a.amplitude);

  // 2) Lojas por gestor
  const gestorLojaMap = new Map<string, Map<string, { identificados: number; vendas: number }>>();
  for (const r of regs) {
    const loja = dados.lojas.find((l) => l.id === r.lojaId);
    if (!loja) continue;
    if (!gestorLojaMap.has(loja.gestor)) gestorLojaMap.set(loja.gestor, new Map());
    const lm = gestorLojaMap.get(loja.gestor)!;
    const cur = lm.get(loja.nome) ?? { identificados: 0, vendas: 0 };
    cur.identificados += r.identificados;
    cur.vendas += r.vendas;
    lm.set(loja.nome, cur);
  }
  const lojasPorGestor: GrupoDispersao[] = [];
  for (const [gestor, lm] of gestorLojaMap) {
    const pontos: PontoDispersao[] = [...lm.entries()]
      .filter(([, v]) => v.vendas > 0)
      .map(([nome, v]) => ({
        nome,
        taxa: (v.identificados / v.vendas) * 100,
        vendas: v.vendas,
        identificados: v.identificados,
      }))
      .sort((a, b) => a.taxa - b.taxa);
    if (pontos.length < 2) continue;
    lojasPorGestor.push({ grupo: gestor, pontos, ...calcStats(pontos, dados.meta) });
  }
  lojasPorGestor.sort((a, b) => b.amplitude - a.amplitude);

  // 3) Lojas por praça
  const pracaLojaMap = new Map<string, Map<string, { identificados: number; vendas: number }>>();
  for (const r of regs) {
    const loja = dados.lojas.find((l) => l.id === r.lojaId);
    if (!loja) continue;
    if (!pracaLojaMap.has(loja.praca)) pracaLojaMap.set(loja.praca, new Map());
    const lm = pracaLojaMap.get(loja.praca)!;
    const cur = lm.get(loja.nome) ?? { identificados: 0, vendas: 0 };
    cur.identificados += r.identificados;
    cur.vendas += r.vendas;
    lm.set(loja.nome, cur);
  }
  const lojasPorPraca: GrupoDispersao[] = [];
  for (const [praca, lm] of pracaLojaMap) {
    const pontos: PontoDispersao[] = [...lm.entries()]
      .filter(([, v]) => v.vendas > 0)
      .map(([nome, v]) => ({
        nome,
        taxa: (v.identificados / v.vendas) * 100,
        vendas: v.vendas,
        identificados: v.identificados,
      }))
      .sort((a, b) => a.taxa - b.taxa);
    if (pontos.length < 2) continue;
    lojasPorPraca.push({ grupo: praca, pontos, ...calcStats(pontos, dados.meta) });
  }
  lojasPorPraca.sort((a, b) => b.amplitude - a.amplitude);

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
    dispersao: { consultoresPorLoja, lojasPorGestor, lojasPorPraca },
    serieIndevido,
  };
}

export const fmtPct = (n: number, d = 1) =>
  `${n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d })}%`;

export const fmtNum = (n: number) => n.toLocaleString("pt-BR");

export const fmtData = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};
