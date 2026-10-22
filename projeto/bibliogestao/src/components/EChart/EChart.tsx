import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import {
  BarChart,
  LineChart,
  type BarSeriesOption,
  type LineSeriesOption,
} from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  type GridComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// Registra só o que os gráficos usam (tree-shaking).
echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  CanvasRenderer,
]);

// Tipo das opções aceitas. Ao registrar um novo tipo acima, inclua o
// "Option" correspondente aqui para o TypeScript reconhecê-lo.
export type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | GridComponentOption
  | TooltipComponentOption
>;

type EChartProps = {
  option: ECOption;
  height?: number;
  ariaLabel: string;
};

function EChart({ option, height = 320, ariaLabel }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof echarts.init> | null>(null);

  // Cria o gráfico uma vez e acompanha o tamanho do card
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = echarts.init(container);
    chartRef.current = chart;

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  // Redesenha quando as opções mudam
  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      style={{ width: "100%", height }}
    />
  );
}

export default EChart;
