import { useMemo } from "react";

import EChart, { type ECOption } from "../../components/EChart/EChart";
import type { MonthStat } from "../../services/dashboardService";

const COR = "#7c3aed";
const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

// "2026-10" -> "out/26"
function rotuloMes(month: string) {
  const [ano, mes] = month.split("-");
  return `${MESES[Number(mes) - 1]}/${ano.slice(2)}`;
}

type MonthlyChartProps = {
  data: MonthStat[];
};

function MonthlyChart({ data }: MonthlyChartProps) {
  const option = useMemo<ECOption>(
    () => ({
      textStyle: { fontFamily: "Poppins, sans-serif" },
      grid: { left: 8, right: 24, top: 24, bottom: 8, containLabel: true },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        boundaryGap: false, // a linha começa colada no eixo
        data: data.map((item) => rotuloMes(item.month)),
      },
      yAxis: { type: "value", minInterval: 1 },
      series: [
        {
          name: "Livros cadastrados",
          type: "line",
          data: data.map((item) => item.total),
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 3, color: COR },
          itemStyle: { color: COR },
          areaStyle: { color: COR, opacity: 0.15 },
        },
      ],
    }),
    [data],
  );

  return (
    <EChart
      option={option}
      height={300}
      ariaLabel="Gráfico de linha com os livros cadastrados por mês nos últimos 12 meses"
    />
  );
}

export default MonthlyChart;
