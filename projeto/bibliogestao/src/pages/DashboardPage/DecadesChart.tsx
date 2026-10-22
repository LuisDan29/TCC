import { useMemo } from "react";

import EChart, { type ECOption } from "../../components/EChart/EChart";
import type { DecadeStat } from "../../services/dashboardService";

const COR = "#2f62e0";

type DecadesChartProps = {
  data: DecadeStat[];
};

function DecadesChart({ data }: DecadesChartProps) {
  const option = useMemo<ECOption>(
    () => ({
      textStyle: { fontFamily: "Poppins, sans-serif" },
      grid: { left: 8, right: 16, top: 28, bottom: 8, containLabel: true },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: {
        type: "category",
        data: data.map((item) => `${item.decade}s`),
      },
      yAxis: { type: "value", minInterval: 1 },
      series: [
        {
          name: "Títulos",
          type: "bar",
          data: data.map((item) => item.total),
          barMaxWidth: 56,
          itemStyle: { color: COR, borderRadius: [6, 6, 0, 0] },
          label: { show: true, position: "top" },
        },
      ],
    }),
    [data],
  );

  if (data.length === 0) {
    return (
      <p className="text-secondary mb-0">
        Nenhum livro com ano de publicação informado.
      </p>
    );
  }

  return (
    <EChart
      option={option}
      height={320}
      ariaLabel="Gráfico de colunas com a quantidade de títulos por década de publicação"
    />
  );
}

export default DecadesChart;
