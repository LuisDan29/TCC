import { useMemo } from "react";

import EChart, { type ECOption } from "../../components/EChart/EChart";
import type { NameTotal } from "../../services/dashboardService";
import { CHART_FONT, THEME, tooltipBase } from "./dashboardTheme";

type RankingChartProps = {
  data: NameTotal[];
  color: string;
  seriesName: string;
  ariaLabel: string;
  emptyMessage: string;
};

// Ranking em barras horizontais (gêneros, autores...). O maior fica no topo.
function RankingChart({
  data,
  color,
  seriesName,
  ariaLabel,
  emptyMessage,
}: RankingChartProps) {
  const option = useMemo<ECOption>(
    () => ({
      textStyle: { fontFamily: CHART_FONT },
      grid: { left: 8, right: 36, top: 4, bottom: 4, containLabel: true },
      tooltip: {
        ...tooltipBase,
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      // Sem eixo numérico: o valor já aparece na ponta de cada barra
      xAxis: {
        type: "value",
        minInterval: 1,
        show: false,
        max: (value: { max: number }) =>
          value.max + Math.max(1, Math.ceil(value.max * 0.15)),
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: data.map((item) => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        // Nomes longos são cortados com "…"; o tooltip mostra o nome completo
        axisLabel: {
          width: 150,
          overflow: "truncate",
          color: THEME.text,
          fontSize: 13,
        },
      },
      series: [
        {
          name: seriesName,
          type: "bar",
          data: data.map((item) => item.total),
          barMaxWidth: 20,
          // Trilho claro atrás de cada barra, para comparar com o máximo
          showBackground: true,
          backgroundStyle: { color: THEME.track, borderRadius: [0, 8, 8, 0] },
          itemStyle: { color, borderRadius: [0, 8, 8, 0] },
          label: {
            show: true,
            position: "right",
            color: THEME.muted,
            fontWeight: 600,
          },
        },
      ],
    }),
    [data, color, seriesName],
  );

  if (data.length === 0) {
    return <p className="text-secondary mb-0">{emptyMessage}</p>;
  }

  return (
    <EChart
      option={option}
      height={Math.max(160, data.length * 36 + 24)}
      ariaLabel={ariaLabel}
    />
  );
}

export default RankingChart;
