import type {
  AttentionBook,
  ConditionStat,
  MonthStat,
} from "../../services/dashboardService";

// Cálculos em cima dos dados que o banco já devolve. Ficam aqui (fora dos
// componentes) para os cartões e gráficos só se preocuparem em desenhar.

export function formatNumber(value: number) {
  return value.toLocaleString("pt-BR");
}

export function formatPercent(value: number, digits = 0) {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: digits })}%`;
}

// ---------- Estado dos exemplares ----------

// "Bom estado" = Regular (3), Bem conservado (4) e Novo (5).
// Para mudar o critério, ajuste só este número.
const FIRST_GOOD_CONDITION = 3;

export type ConditionsSummary = {
  totalCopies: number;
  goodCopies: number;
  attentionCopies: number; // Irrecuperável, Precária e Desgastado
  goodPercent: number | null; // null quando não há exemplares
};

export function summarizeConditions(
  conditions: ConditionStat[],
): ConditionsSummary {
  let totalCopies = 0;
  let goodCopies = 0;

  for (const item of conditions) {
    totalCopies += item.quantity;
    if (item.condition >= FIRST_GOOD_CONDITION) goodCopies += item.quantity;
  }

  return {
    totalCopies,
    goodCopies,
    attentionCopies: totalCopies - goodCopies,
    goodPercent: totalCopies > 0 ? (goodCopies / totalCopies) * 100 : null,
  };
}

// ---------- Cadastros por mês ----------

// Cadastros do mês atual e do anterior (a lista termina no mês atual)
export function monthComparison(byMonth: MonthStat[]) {
  const current = byMonth[byMonth.length - 1]?.total ?? 0;
  const previous = byMonth[byMonth.length - 2]?.total ?? 0;

  return { current, previous, delta: current - previous };
}

export type GrowthPoint = {
  month: string; // "YYYY-MM"
  added: number; // títulos cadastrados naquele mês
  accumulated: number; // total de títulos ao fim daquele mês
};

// Acumulado = títulos que já existiam antes da janela de 12 meses
// + o que foi cadastrado até cada mês. Conta só os títulos que ainda
// existem hoje (um título excluído não entra na conta).
export function buildGrowth(
  totalTitles: number,
  byMonth: MonthStat[],
): GrowthPoint[] {
  const addedInWindow = byMonth.reduce((sum, item) => sum + item.total, 0);
  let accumulated = totalTitles - addedInWindow;

  return byMonth.map((item) => {
    accumulated += item.total;
    return { month: item.month, added: item.total, accumulated };
  });
}

// ---------- Títulos que precisam de ação ----------

export type AttentionReason = {
  kind: "no_stock" | "unusable" | "poor" | "worn";
  label: string;
};

function quantity(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

// Por que o título está na lista: sem estoque e/ou exemplares em estado ruim
export function attentionReasons(book: AttentionBook): AttentionReason[] {
  const reasons: AttentionReason[] = [];

  if (book.stock_quantity === 0) {
    reasons.push({ kind: "no_stock", label: "Sem estoque" });
  }
  if (book.unusable > 0) {
    reasons.push({
      kind: "unusable",
      label: quantity(book.unusable, "irrecuperável", "irrecuperáveis"),
    });
  }
  if (book.poor > 0) {
    reasons.push({
      kind: "poor",
      label: quantity(book.poor, "precário", "precários"),
    });
  }
  if (book.worn > 0) {
    reasons.push({
      kind: "worn",
      label: quantity(book.worn, "desgastado", "desgastados"),
    });
  }

  return reasons;
}