import type { ReactNode } from "react";

import type {
  ConditionStat,
  DashboardTotals,
  MonthStat,
} from "../../services/dashboardService";
import {
  formatNumber,
  formatPercent,
  monthComparison,
  summarizeConditions,
} from "./dashboardMetrics";
import { CARD_STYLE, THEME } from "./dashboardTheme";

// Cores do cartão "Em bom estado" (% de exemplares nas condições 3 a 5):
// verde a partir de 80%, âmbar a partir de 60%, vermelho abaixo disso.
const GOOD_FROM = 80;
const WARNING_FROM = 60;

function goodStateColor(percent: number | null) {
  if (percent === null) return THEME.muted;
  if (percent >= GOOD_FROM) return THEME.good;
  if (percent >= WARNING_FROM) return THEME.warning;
  return THEME.danger;
}

type Kpi = {
  label: string;
  value: string;
  color: string;
  hint: ReactNode; // linha de contexto embaixo do número
};

type KpiCardsProps = {
  totals: DashboardTotals;
  conditions?: ConditionStat[];
  byMonth?: MonthStat[];
};

function KpiCards({ totals, conditions = [], byMonth = [] }: KpiCardsProps) {
  const month = monthComparison(byMonth);
  const summary = summarizeConditions(conditions);

  const averageCopies = totals.titles > 0 ? totals.copies / totals.titles : 0;
  const withoutStockPercent =
    totals.titles > 0 ? (totals.titles_without_stock / totals.titles) * 100 : 0;

  const attention = summary.attentionCopies;

  const kpis: Kpi[] = [
    {
      label: "Títulos cadastrados",
      value: formatNumber(totals.titles),
      color: THEME.navy,
      hint: (
        <>
          {month.current > 0 ? (
            <strong style={{ color: THEME.good }}>
              +{formatNumber(month.current)} este mês
            </strong>
          ) : (
            "Nenhum cadastro este mês"
          )}
          {month.previous > 0 &&
            ` · ${formatNumber(month.previous)} no mês anterior`}
        </>
      ),
    },
    {
      label: "Exemplares no acervo",
      value: formatNumber(totals.copies),
      color: THEME.blue,
      hint:
        totals.titles > 0
          ? `média de ${averageCopies.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} por título`
          : "Nenhum título cadastrado",
    },
    {
      label: "Exemplares em bom estado",
      value:
        summary.goodPercent === null ? "—" : formatPercent(summary.goodPercent),
      color: goodStateColor(summary.goodPercent),
      hint:
        summary.totalCopies === 0
          ? "Nenhum exemplar cadastrado"
          : attention === 0
            ? "Nenhum exemplar precisa de atenção"
            : `${formatNumber(attention)} ${attention === 1 ? "exemplar precisa" : "exemplares precisam"} de atenção`,
    },
    {
      label: "Títulos sem estoque",
      value: formatNumber(totals.titles_without_stock),
      // Vermelho só quando há algo a resolver
      color: totals.titles_without_stock > 0 ? THEME.danger : THEME.good,
      hint:
        totals.titles_without_stock > 0
          ? `${formatPercent(withoutStockPercent, 1)} dos títulos`
          : "Todos os títulos têm exemplares",
    },
  ];

  return (
    <section className="row g-3 mb-3" aria-label="Resumo do acervo">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="col-6 col-lg-3">
          <div className="p-3 p-lg-4 h-100" style={CARD_STYLE}>
            <div
              className="d-flex align-items-center gap-2 small fw-semibold mb-2"
              style={{ color: THEME.muted }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  flex: "none",
                  borderRadius: "50%",
                  backgroundColor: kpi.color,
                }}
              />
              {kpi.label}
            </div>

            <div
              className="fw-bold lh-1 mb-2"
              style={{
                color: kpi.color,
                fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
              }}
            >
              {kpi.value}
            </div>

            <div className="small" style={{ color: THEME.muted }}>
              {kpi.hint}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default KpiCards;
