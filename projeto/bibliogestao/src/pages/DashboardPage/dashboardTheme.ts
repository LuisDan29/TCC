import type { CSSProperties } from "react";
import type { TooltipComponentOption } from "echarts/components";

// Identidade visual do dashboard. Cores, fonte e estilo dos cartões ficam
// aqui para que todos os gráficos e cartões fiquem consistentes.
export const THEME = {
  // Marca (mesmas cores do restante do sistema)
  navy: "#1A335B",
  navyDark: "#0f1c35",
  blue: "#2f62e0",
  teal: "#0d9488",
  violet: "#7c3aed",

  // Neutros
  text: "#0f1c35",
  muted: "#64748b",
  border: "#e2e8f0",
  track: "#f1f5f9", // trilho claro atrás das barras
  page: "#eef2f7", // fundo da página

  // Estados
  good: "#15803d",
  warning: "#b45309",
  danger: "#c62828",
};

export const CHART_FONT = "Poppins, sans-serif";

// Estilo do cartão branco usado por KPIs e gráficos
export const CARD_STYLE: CSSProperties = {
  backgroundColor: "#fff",
  border: `1px solid ${THEME.border}`,
  borderRadius: "30px",
  boxShadow:
    "0 1px 2px rgba(15, 28, 53, .04), 0 12px 32px rgba(15, 28, 53, .07)",
};

// Base do tooltip de todos os gráficos. Cada gráfico acrescenta o seu
// "trigger": tooltip: { ...tooltipBase, trigger: "axis" }
export const tooltipBase: TooltipComponentOption = {
  backgroundColor: THEME.navyDark,
  borderWidth: 0,
  padding: [8, 12],
  textStyle: { color: "#fff", fontFamily: CHART_FONT, fontSize: 13 },
  extraCssText:
    "border-radius: 12px; box-shadow: 0 8px 24px rgba(15, 28, 53, .25);",
};
