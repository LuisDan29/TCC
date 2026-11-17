import { useMemo } from "react";

import EChart, { type ECOption } from "../../components/EChart/EChart";
import type { MonthStat } from "../../services/dashboardService";
import { buildGrowth } from "./dashboardMetrics";
import { CHART_FONT, THEME, tooltipBase } from "./dashboardTheme";

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
function monthLabel(month: string) {
  const [year, monthNumber] = month.split("-");
  return `${MESES[Number(monthNumber) - 1]}/${year.slice(2)}`;
}

type GrowthChartProps = {
  totalTitles: number;
  byMonth: MonthStat[];
};

// Colunas = títulos cadastrados em cada mês (eixo da esquerda).
// Linha = total de títulos ao fim do mês (eixo da direita).
function GrowthChart({ totalTitles, byMonth }: GrowthChartProps) {
  const points = useMemo(
    () => buildGrowth(totalTitles, byMonth),
    [totalTitles, byMonth],
  );

  const option = useMemo<ECOption>(
    () => ({
      textStyle: { fontFamily: CHART_FONT },
      grid: { left: 8, right: 8, top: 40, bottom: 8, containLabel: true },
      legend: {
        top: 0,
        right: 0,
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 8,
        itemGap: 16,
        textStyle: {
          color: THEME.muted,
          fontFamily: CHART_FONT,
          fontSize: 12,
        },
      },
      tooltip: {
        ...tooltipBase,
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      xAxis: {
        type: "category",
        data: points.map((point) => monthLabel(point.month)),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: THEME.border } },
        axisLabel: { color: THEME.muted },
      },
      yAxis: [
        {
          // Cadastros no mês
          type: "value",
          minInterval: 1,
          axisLabel: { color: THEME.muted },
          splitLine: { lineStyle: { color: THEME.border, type: "dashed" } },
        },
        {
          // Total acumulado: "scale" ajusta o eixo à faixa de valores, senão a
          // linha ficaria achatada no topo (o total é bem maior que o mês)
          type: "value",
          scale: true,
          minInterval: 1,
          axisLabel: { color: THEME.muted },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Cadastros no mês",
          type: "bar",
          yAxisIndex: 0,
          data: points.map((point) => point.added),
          barMaxWidth: 28,
          itemStyle: { color: THEME.blue, borderRadius: [8, 8, 0, 0] },
        },
        {
          name: "Total de títulos",
          type: "line",
          yAxisIndex: 1,
          data: points.map((point) => point.accumulated),
          smooth: true,
          symbol: "circle",
          symbolSize: 7,
          lineStyle: { width: 3, color: THEME.teal },
          itemStyle: { color: THEME.teal, borderColor: "#fff", borderWidth: 2 },
        },
      ],
    }),
    [points],
  );

  if (totalTitles === 0) {
    return (
      <p className="text-secondary mb-0">Nenhum livro cadastrado ainda.</p>
    );
  }

  return (
    <EChart
      option={option}
      height={320}
      ariaLabel="Gráfico combinado com os títulos cadastrados por mês e o total acumulado de títulos nos últimos 12 meses"
    />
  );
}

export default GrowthChart;
