"""
processar_dados.py
Lê todos os arquivos DD-MM-YYYY.xlsx da pasta raiz e dCentros v2.xlsx
e gera public/data/processed/dados_consolidados.json

Uso:
  python scripts/processar_dados.py
"""
import pandas as pd
import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT
DCENTROS = ROOT / "dCentros" / "dCentros v2.xlsx"
OUT = ROOT / "public" / "data" / "processed" / "dados_consolidados.json"
META = 100.0

def main():
    if not DCENTROS.exists():
        sys.exit(f"Arquivo não encontrado: {DCENTROS}")

    dc = pd.read_excel(DCENTROS, sheet_name=0, dtype=str)
    dc.columns = ["DIVISAO","ORG_VENDAS","BCPS","LOJA","PRACA","GVO","GCVO","GRVO",
                  "CANAL","EMPRESA","REGIONAL","CLUSTER","CATEGORIA","GNCF","PPC","REPASSE"]

    loja_info = {}
    for _, row in dc.iterrows():
        bcps = str(row["BCPS"]).strip()
        loja_info[bcps] = {
            "id": bcps, "nome": str(row["LOJA"]).strip(),
            "praca": str(row["PRACA"]).strip(), "gestor": str(row["GVO"]).strip(),
            "gcvo": str(row["GCVO"]).strip(), "grvo": str(row["GRVO"]).strip(),
            "regional": str(row["REGIONAL"]).strip(), "cluster": str(row["CLUSTER"]).strip(),
            "categoria": str(row["CATEGORIA"]).strip(),
        }

    files = sorted(DATA_DIR.glob("??-??-????.xlsx"))
    if not files:
        sys.exit("Nenhum arquivo DD-MM-YYYY.xlsx encontrado.")

    registros_pdv, registros_cons, all_dates = [], [], []

    for f in files:
        m = re.match(r"(\d{2})-(\d{2})-(\d{4})", f.name)
        if not m:
            continue
        dd, mm, yyyy = m.groups()
        data_iso = f"{yyyy}-{mm}-{dd}"
        all_dates.append(data_iso)

        df_pdv = pd.read_excel(f, sheet_name="PDV", header=None, dtype={0: str})
        for i in range(2, len(df_pdv)):
            row = df_pdv.iloc[i]
            pdv = str(row[0]).strip()
            if not pdv or pdv in ("nan", "PDV"):
                continue
            try:
                identificados = float(row[5]) if pd.notna(row[5]) else 0
                boletos = float(row[20]) if pd.notna(row[20]) else 0
                atend_id = float(row[2]) if pd.notna(row[2]) else 0
                taxa = round((identificados / boletos * 100) if boletos > 0 else 0, 4)
                registros_pdv.append({
                    "data": data_iso, "lojaId": pdv,
                    "vendas": int(boletos), "identificados": int(identificados),
                    "atendId": int(atend_id), "taxa": taxa,
                })
            except Exception:
                pass

        df_cons = pd.read_excel(f, sheet_name="CONSULTOR", dtype={0: str})
        df_cons.columns = list(range(len(df_cons.columns)))
        for _, row in df_cons.iterrows():
            pdv = str(row[0]).strip()
            consultor = str(row[1]).strip() if pd.notna(row[1]) else ""
            if not pdv or pdv in ("nan", "PDV") or not consultor:
                continue
            try:
                atend_id = float(row[2]) if pd.notna(row[2]) else 0
                boletos = float(row[7]) if pd.notna(row[7]) else 0
                boletos_id = float(row[8]) if pd.notna(row[8]) else 0
                taxa_raw = float(row[4]) if pd.notna(row[4]) else 0
                taxa = round(taxa_raw * 100 if taxa_raw <= 5 else taxa_raw, 4)
                registros_cons.append({
                    "data": data_iso, "lojaId": pdv, "consultor": consultor,
                    "vendas": int(boletos), "identificados": int(boletos_id),
                    "atendId": int(atend_id), "taxa": taxa,
                })
            except Exception:
                pass

    all_dates.sort()
    ids_presentes = set(r["lojaId"] for r in registros_pdv)
    lojas_list = []
    for lid in sorted(ids_presentes):
        lojas_list.append(loja_info.get(lid, {
            "id": lid, "nome": lid, "praca": "N/D", "gestor": "N/D",
            "gcvo": "N/D", "grvo": "N/D", "regional": "N/D",
            "cluster": "N/D", "categoria": "N/D",
        }))

    payload = {
        "indicador": "ID do Cliente",
        "descricao": "% Atendimentos com CPF identificados (com e sem compra) / Total Boletos Loja",
        "unidade": "%", "meta": META,
        "periodo": {"inicio": all_dates[0], "fim": all_dates[-1]},
        "atualizadoEm": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "pracas": sorted(set(l["praca"] for l in lojas_list)),
        "gestores": sorted(set(l["gestor"] for l in lojas_list)),
        "consultores": sorted(set(r["consultor"] for r in registros_cons)),
        "lojas": lojas_list,
        "registros": registros_pdv,
        "registrosConsultor": registros_cons,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, separators=(",", ":"))

    print(f"OK: {OUT}")
    print(f"  Periodo: {all_dates[0]} → {all_dates[-1]}")
    print(f"  Lojas: {len(lojas_list)}  |  Registros PDV: {len(registros_pdv)}  |  Registros Consultor: {len(registros_cons)}")

if __name__ == "__main__":
    main()