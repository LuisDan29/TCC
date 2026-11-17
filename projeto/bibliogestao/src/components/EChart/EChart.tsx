import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import {
  BarChart,
  LineChart,
  PieChart,
  type BarSeriesOption,
  type LineSeriesOption,
  type PieSeriesOption,
} from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  type GridComponentOption,
  type LegendComponentOption,
  type TitleComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// Registra só o que os gráficos usam (tree-shaking).
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
]);

// Tipo das opções aceitas. Ao registrar um novo tipo acima, inclua o
// "Option" correspondente aqui para o TypeScript reconhecê-lo.
export type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | GridComponentOption
  | LegendComponentOption
  | TitleComponentOption
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

    const resize = () => chart.resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    // Ao imprimir o relatório a largura da página muda: redesenha o gráfico
    // para ele caber na folha (e volta ao normal depois).
    const printQuery = window.matchMedia("print");
    printQuery.addEventListener("change", resize);
    window.addEventListener("beforeprint", resize);
    window.addEventListener("afterprint", resize);

    return () => {
      observer.disconnect();
      printQuery.removeEventListener("change", resize);
      window.removeEventListener("beforeprint", resize);
      window.removeEventListener("afterprint", resize);
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
