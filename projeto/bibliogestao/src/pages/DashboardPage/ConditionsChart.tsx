import { useMemo } from "react";

import EChart, { type ECOption } from "../../components/EChart/EChart";
import { BOOK_CONDITIONS } from "../../constants/bookConditions";
import type { ConditionStat } from "../../services/dashboardService";

type ConditionsChartProps = {
  data: ConditionStat[];
};

function ConditionsChart({ data }: ConditionsChartProps) {
  const option = useMemo<ECOption>(() => {
    // Uma barra por condição, na ordem de BOOK_CONDITIONS (0 a 5),
    // com a mesma cor usada nos selos do restante do sistema.
    const bars = BOOK_CONDITIONS.map((condition) => ({
      value:
        data.find((item) => item.condition === condition.number)?.quantity ?? 0,
      itemStyle: { color: condition.color },
    }));

    return {
      textStyle: { fontFamily: "Poppins, sans-serif" },
      grid: { left: 8, right: 32, top: 8, bottom: 8, containLabel: true },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: { type: "value", minInterval: 1 },
      yAxis: {
        type: "category",
        inverse: true, // "Irrecuperável" no topo, "Novo" embaixo
        data: BOOK_CONDITIONS.map((condition) => condition.name),
      },
      series: [
        {
          name: "Exemplares",
          type: "bar",
          data: bars,
          barMaxWidth: 28,
          itemStyle: { borderRadius: [0, 6, 6, 0] },
          label: { show: true, position: "right" },
        },
      ],
    };
  }, [data]);

  return (
    <EChart
      option={option}
      height={320}
      ariaLabel="Gráfico de barras com a quantidade de exemplares por condição"
    />
  );
}

export default ConditionsChart;
