# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
# Desenvolvimento local
npm run dev          # Vite dev server (base path /Dashboard_id_cliente/)

# Build e preview
npm run build        # Gera dist/ para GitHub Pages
npm run preview      # Preview do build local

# Qualidade
npm run lint         # ESLint
npm run format       # Prettier

# Processar dados Excel → JSON
python scripts/processar_dados.py
```

O deploy acontece automaticamente via GitHub Actions ao fazer push na branch `main`. O artifact `dist/` é publicado em `https://fabio-paulo-silva.github.io/Dashboard_id_cliente/`.

## Arquitetura

### Fluxo de dados

```
DD-MM-YYYY.xlsx (PDV + CONSULTOR) ──┐
dCentros/dCentros v2.xlsx ──────────┴── processar_dados.py ──▶ public/data/processed/dados_consolidados.json
                                                                         │
                                                               fetchDados() (React Query)
                                                                         │
                                                               computar(dados, filtros)   ← src/lib/dashboard-data.ts
                                                                         │
                                                               DashboardComputed ──▶ tabs (7 visões)
```

### Fórmula crítica — % ID Cliente

```
% ID Cliente = (Atendimentos com CPF − Usos Indevidos) / Total Boletos × 100
Meta = 125%
```

No Python (`processar_dados.py`):
- **PDV:** `cpf_net = max(0, cpf_bruto − atend_indevido)` → `taxa = cpf_net / boletos × 100`
- **CONSULTOR:** `taxa_raw = row[4]` (já é `(cpf−inv)/bol`) → `atend_cpf_net = round(taxa_raw × boletos)`

### Camadas principais

| Camada | Arquivo | Responsabilidade |
|--------|---------|-----------------|
| Processamento | `scripts/processar_dados.py` | Excel → JSON consolidado |
| Tipos + cálculos | `src/lib/dashboard-data.ts` | Interfaces TS, `computar()`, `fetchDados()` |
| Rota principal | `src/routes/index.tsx` | Estado de filtros + tabs, orquestra tudo |
| Componentes | `src/components/dashboard/` | Um componente por visão |
| UI base | `src/components/ui/` | shadcn/ui (não editar diretamente) |

### `dashboard-data.ts` — funções-chave

- **`fetchDados()`** — busca o JSON via React Query, `staleTime: Infinity`
- **`computar(dados, filtros)`** — recebe os dados brutos + filtros ativos, devolve `DashboardComputed` com todas as séries e rankings calculados. **Todos os gráficos derivam daqui.**
- **`registrosNoIntervalo(registros, ids, inicio, fim)`** — filtra registros PDV por lojas e datas. A variável `regs` resultante alimenta a maioria dos cálculos.
- **`regsConsultor`** — filtra `registrosConsultor` separadamente, incluindo o filtro de nome de consultor. Usado por `serieIndevido` quando `f.consultor !== "all"`.
- **`calcStats(pontos, meta)`** — estatísticas de dispersão: min, max, média, mediana, amplitude, desvio vs meta (acima/abaixo separados).

### Tabs e componentes

| Tab id | Componente principal |
|--------|---------------------|
| `geral` | `EvolutionChart` + `PracaChart` + `RankingTable` |
| `lojas` | `RankingTable` |
| `consultores` | `ConsultorTable` |
| `gestores` | `GestorTable` + `PracaChart` |
| `diaadia` | `DiaADiaTable` + `EvolutionChart` |
| `dispersao` | `DispersaoView` (3 sub-visões) |
| `indevido` | `UsoIndevidoTable` + `IndevidoChart` |

### Padrão de closure nos gráficos Recharts

Recharts não passa o array completo de série para `LabelList.content` nem `Tooltip.content`. Padrão usado:

```typescript
// Captura a série no closure para acessar o dia anterior
function makeDataLabel(serie: SerieDiaria[]) {
  return function DataLabel({ x, y, value, index }: any) { ... }
}
function makeTooltip(serie: SerieDiaria[], meta: number) {
  return function ChartTooltip({ active, payload }: any) { ... }
}
```

Usar `serie.findIndex(s => s.data === p.data)` para localizar o ponto atual e calcular delta.

## Stack técnica

- **React 19** + **TanStack Router v1** (file-based routing, `createFileRoute`)
- **Vite 7**, base path `/Dashboard_id_cliente/`
- **Tailwind CSS v4** com tokens oklch (`--primary: oklch(0.76 0.19 152)` — verde)
- **Recharts v2**: `AreaChart`, `LabelList` com content customizado via closures
- **TanStack React Query v5**, `staleTime: Infinity` (dados não mudam durante a sessão)
- **Framer Motion** (`motion/react`) para animações de entrada nos cards/tabelas
- **shadcn/ui** (new-york style) em `src/components/ui/` — não modificar diretamente

## Tarefa agendada

`atualizar-dashboard-id-cliente` roda diariamente às 09:30: copia novos `.xlsx`, executa o script Python, faz `git commit + push`. O GitHub Actions então faz o deploy automaticamente.
