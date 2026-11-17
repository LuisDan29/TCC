import { useMemo } from "react";

import EChart, { type ECOption } from "../../components/EChart/EChart";
import { formatNumber, formatPercent } from "./dashboardMetrics";
import { CHART_FONT, THEME, tooltipBase } from "./dashboardTheme";

export type DonutSlice = {
  name: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  slices: DonutSlice[];
  centerValue: string; // texto grande no meio do donut
  centerLabel: string; // texto pequeno embaixo dele
  unit: string; // usado no tooltip: "12 exemplares (34%)"
  ariaLabel: string;
};

// Donut com a legenda em lista embaixo (nome, quantidade e porcentagem).
// Usado pelos gráficos de condição e de idiomas.
function DonutChart({
  slices,
  centerValue,
  centerLabel,
  unit,
  ariaLabel,
}: DonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  const option = useMemo<ECOption>(
    () => ({
      textStyle: { fontFamily: CHART_FONT },
      tooltip: {
        ...tooltipBase,
        trigger: "item",
        formatter: `{b}<br/>{c} ${unit} ({d}%)`,
      },
      title: {
        text: centerValue,
        subtext: centerLabel,
        left: "center",
        top: "center",
        itemGap: 2,
        textStyle: {
          color: THEME.text,
          fontFamily: CHART_FONT,
          fontSize: 28,
          fontWeight: 700,
        },
        subtextStyle: {
          color: THEME.muted,
          fontFamily: CHART_FONT,
          fontSize: 12,
        },
      },
      series: [
        {
          type: "pie",
          radius: ["62%", "88%"],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: "#fff", borderWidth: 3, borderRadius: 6 },
          // Fatias vazias ficam só na legenda
          data: slices
            .filter((slice) => slice.value > 0)
            .map((slice) => ({
              name: slice.name,
              value: slice.value,
              itemStyle: { color: slice.color },
            })),
        },
      ],
    }),
    [slices, centerValue, centerLabel, unit],
  );

  return (
    <>
      <EChart option={option} height={220} ariaLabel={ariaLabel} />

      <ul className="list-unstyled m-0 mt-3 d-flex flex-column gap-2">
        {slices.map((slice) => {
          const percent = total > 0 ? (slice.value / total) * 100 : 0;

          return (
            <li
              key={slice.name}
              className="d-flex align-items-center gap-2 small"
            >
              <span
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  flex: "none",
                  borderRadius: "50%",
                  backgroundColor: slice.color,
                }}
              />
              <span
                className="flex-grow-1 text-truncate"
                style={{ color: THEME.text }}
              >
                {slice.name}
              </span>
              <strong style={{ color: THEME.text }}>
                {formatNumber(slice.value)}
              </strong>
              <span
                className="text-end"
                style={{ minWidth: "3.5rem", color: THEME.muted }}
              >
                {formatPercent(percent, 1)}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default DonutChart;
