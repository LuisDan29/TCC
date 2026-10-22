import { useMemo } from "react";

import EChart, { type ECOption } from "../../components/EChart/EChart";
import type { NameTotal } from "../../services/dashboardService";

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
      textStyle: { fontFamily: "Poppins, sans-serif" },
      grid: { left: 8, right: 32, top: 8, bottom: 8, containLabel: true },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: { type: "value", minInterval: 1 },
      yAxis: {
        type: "category",
        inverse: true,
        data: data.map((item) => item.name),
        // Nomes longos são cortados com "…"; o tooltip mostra o nome completo
        axisLabel: { width: 150, overflow: "truncate" },
      },
      series: [
        {
          name: seriesName,
          type: "bar",
          data: data.map((item) => item.total),
          barMaxWidth: 24,
          itemStyle: { color, borderRadius: [0, 6, 6, 0] },
          label: { show: true, position: "right" },
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
