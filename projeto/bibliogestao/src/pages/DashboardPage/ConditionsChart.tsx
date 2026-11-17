import { useMemo } from "react";

import { BOOK_CONDITIONS } from "../../constants/bookConditions";
import type { ConditionStat } from "../../services/dashboardService";
import DonutChart, { type DonutSlice } from "./DonutChart";
import { formatPercent, summarizeConditions } from "./dashboardMetrics";

type ConditionsChartProps = {
  data: ConditionStat[];
};

function ConditionsChart({ data }: ConditionsChartProps) {
  const summary = useMemo(() => summarizeConditions(data), [data]);

  // Uma fatia por condição (0 a 5), na ordem de BOOK_CONDITIONS e com a
  // mesma cor usada nos selos do restante do sistema.
  const slices = useMemo<DonutSlice[]>(
    () =>
      BOOK_CONDITIONS.map((condition) => ({
        name: condition.name,
        value:
          data.find((item) => item.condition === condition.number)?.quantity ??
          0,
        color: condition.color,
      })),
    [data],
  );

  if (summary.totalCopies === 0) {
    return (
      <p className="text-secondary mb-0">Nenhum exemplar cadastrado ainda.</p>
    );
  }

  return (
    <DonutChart
      slices={slices}
      centerValue={formatPercent(summary.goodPercent ?? 0)}
      centerLabel="em bom estado"
      unit="exemplares"
      ariaLabel="Gráfico de rosca com a quantidade de exemplares por condição"
    />
  );
}

export default ConditionsChart;
