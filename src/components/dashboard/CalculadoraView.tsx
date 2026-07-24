import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calculator, Copy, Check, PartyPopper } from "lucide-react";
import { SearchSelect } from "./SearchSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LOJAS_CALC } from "@/data/calculadora-lojas";

interface Resultado {
  loja: string;
  meta: number;
  boletos: number;
  extraSemCompra: number;
  totalIdentificacoes: number;
}

function calcular(lojaNome: string, boletos: number): Resultado {
  const loja = LOJAS_CALC.find((l) => l.loja === lojaNome)!;
  const identificadosNecessarios = boletos * (loja.meta / 100);
  const extraSemCompra = Math.ceil(identificadosNecessarios - boletos);
  const totalIdentificacoes = Math.ceil(identificadosNecessarios);
  return { loja: loja.loja, meta: loja.meta, boletos, extraSemCompra, totalIdentificacoes };
}

function montarMensagem(r: Resultado): string {
  return [
    "*Meta ID do Cliente*",
    `Loja: ${r.loja} (Meta ${r.meta}%)`,
    `Boletos vendidos hoje: ${r.boletos}`,
    r.extraSemCompra <= 0
      ? "Meta já batida com as identificações do boleto!"
      : `Falta captar mais *${r.extraSemCompra}* atendimento(s) sem compra para bater a meta.`,
    `Total de identificações necessárias: ${r.totalIdentificacoes}`,
  ].join("\n");
}

function distinct<T>(arr: T[]): T[] {
  return [...new Set(arr)].sort((a: any, b: any) => a.localeCompare(b, "pt-BR"));
}

export function CalculadoraView() {
  const [praca, setPraca] = useState("");
  const [gvo, setGvo] = useState("");
  const [lojaNome, setLojaNome] = useState("");
  const [boletos, setBoletos] = useState("");
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [copiado, setCopiado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pracas = useMemo(() => distinct(LOJAS_CALC.map((l) => l.praca)), []);

  const gvos = useMemo(() => {
    const candidatas = praca ? LOJAS_CALC.filter((l) => l.praca === praca) : LOJAS_CALC;
    return distinct(candidatas.map((l) => l.gvo));
  }, [praca]);

  const lojasFiltradas = useMemo(() => {
    return LOJAS_CALC.filter((l) => {
      if (praca && l.praca !== praca) return false;
      if (gvo && l.gvo !== gvo) return false;
      return true;
    }).sort((a, b) => a.loja.localeCompare(b.loja, "pt-BR"));
  }, [praca, gvo]);

  const lojasOpcoes = lojasFiltradas.map((l) => ({
    value: l.loja,
    label: `${l.loja} — Meta ${l.meta}%`,
  }));

  function onPracaChange(v: string) {
    setPraca(v === "all" ? "" : v);
    setGvo("");
    setLojaNome("");
    setResultado(null);
    setErro("");
  }

  function onGvoChange(v: string) {
    setGvo(v === "all" ? "" : v);
    setLojaNome("");
    setResultado(null);
    setErro("");
  }

  function onLojaChange(v: string) {
    setLojaNome(v === "all" ? "" : v);
    setResultado(null);
    setErro("");
  }

  function handleCalcular() {
    setErro("");
    setResultado(null);
    if (!lojaNome) { setErro("Selecione uma loja."); return; }
    const n = Number(boletos);
    if (!boletos.trim() || !Number.isInteger(n) || n <= 0) {
      setErro("Informe um número inteiro positivo de boletos.");
      return;
    }
    setResultado(calcular(lojaNome, n));
  }

  function handleCopiar() {
    if (!resultado) return;
    const texto = montarMensagem(resultado);
    const doSucesso = () => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(texto).then(doSucesso).catch(() => fallback(texto, doSucesso));
    } else {
      fallback(texto, doSucesso);
    }
  }

  function fallback(texto: string, onSucesso: () => void) {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); onSucesso(); } catch {}
    document.body.removeChild(ta);
  }

  const metaBatida = resultado !== null && resultado.extraSemCompra <= 0;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 p-6 text-center shadow-elevated"
      >
        <span className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
          ID do Cliente
        </span>
        <h2 className="font-display text-2xl font-bold text-white">Calculadora de Meta</h2>
        <p className="mt-1 text-sm text-white/70">
          Descubra quantos atendimentos sem compra faltam para bater a meta do dia
        </p>
      </motion.div>

      {/* Formulário */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-2xl border bg-card p-6 shadow-card space-y-5"
      >
        {/* Praça */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Praça</label>
          <Select value={praca || "all"} onValueChange={onPracaChange}>
            <SelectTrigger className="h-11 bg-background text-sm">
              <SelectValue placeholder="Todas as praças" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as praças</SelectItem>
              {pracas.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* GVO */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gestor (GVO)</label>
          <Select value={gvo || "all"} onValueChange={onGvoChange}>
            <SelectTrigger className="h-11 bg-background text-sm">
              <SelectValue placeholder="Todos os gestores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os gestores</SelectItem>
              {gvos.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Loja — com busca */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loja</label>
          <SearchSelect
            label=""
            value={lojaNome || "all"}
            placeholder={lojasFiltradas.length ? "Selecione a loja..." : "Nenhuma loja para esse filtro"}
            options={lojasOpcoes}
            onValueChange={onLojaChange}
            className="w-full"
          />
        </div>

        {/* Boletos */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quantos boletos você vendeu hoje?
          </label>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="Ex: 15"
            value={boletos}
            onChange={(e) => { setBoletos(e.target.value); setErro(""); setResultado(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleCalcular()}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Erro */}
        {erro && (
          <p className="text-sm font-semibold text-destructive">{erro}</p>
        )}

        <Button onClick={handleCalcular} className="w-full h-11 text-base font-bold gap-2">
          <Calculator className="h-4 w-4" />
          Calcular
        </Button>
      </motion.div>

      {/* Resultado */}
      <AnimatePresence>
        {resultado && (
          <motion.div
            key="resultado"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border bg-card p-6 shadow-card text-center space-y-3"
          >
            <p className="font-display font-bold text-foreground">
              {resultado.loja} — Meta {resultado.meta}%
            </p>
            <p className="text-sm text-muted-foreground">
              Você vendeu {resultado.boletos} boleto{resultado.boletos !== 1 ? "s" : ""} hoje.
            </p>

            {metaBatida ? (
              <>
                <div className="flex items-center justify-center gap-2 py-2">
                  <PartyPopper className="h-6 w-6 text-primary" />
                  <span className="font-display text-lg font-bold text-primary">Meta já batida!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nenhum atendimento sem compra adicional necessário.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Capte mais</p>
                <p className="font-display text-6xl font-extrabold text-foreground leading-none py-1">
                  {resultado.extraSemCompra}
                </p>
                <p className="text-sm text-muted-foreground">atendimentos sem compra</p>
              </>
            )}

            <p className="text-xs text-muted-foreground">
              Total de identificações necessárias: {resultado.totalIdentificacoes}
            </p>

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleCopiar}
              >
                {copiado ? (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-primary">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar mensagem
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        % ID Cliente = Identificados (com e sem compra) / Total de boletos
      </p>
    </div>
  );
}
