import { useMemo } from "react";

import EChart, { type ECOption } from "../../components/EChart/EChart";
import type { NameTotal } from "../../services/dashboardService";

const BOTAO = "#1A335B";

type TopGenresChartProps = {
  data: NameTotal[];
};

function TopGenresChart({ data }: TopGenresChartProps) {
  const option = useMemo<ECOption>(
    () => ({
      textStyle: { fontFamily: "Poppins, sans-serif" },
      grid: { left: 8, right: 32, top: 8, bottom: 8, containLabel: true },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: { type: "value", minInterval: 1 },
      yAxis: {
        type: "category",
        inverse: true, // o gênero mais frequente fica no topo
        data: data.map((item) => item.name),
        // Nomes longos são cortados com "…"; o tooltip mostra o nome completo
        axisLabel: { width: 150, overflow: "truncate" },
      },
      series: [
        {
          name: "Títulos",
          type: "bar",
          data: data.map((item) => item.total),
          barMaxWidth: 24,
          itemStyle: { color: BOTAO, borderRadius: [0, 6, 6, 0] },
          label: { show: true, position: "right" },
        },
      ],
    }),
    [data],
  );

  if (data.length === 0) {
    return (
      <p className="text-secondary mb-0">Nenhum gênero cadastrado ainda.</p>
    );
  }

  return (
    <EChart
      option={option}
      height={Math.max(160, data.length * 36 + 24)}
      ariaLabel="Gráfico de barras com os gêneros que têm mais títulos no acervo"
    />
  );
}

export default TopGenresChart;
