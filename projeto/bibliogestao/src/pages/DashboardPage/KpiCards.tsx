import type { DashboardTotals } from "../../services/dashboardService";

const RAIO_CARD = "30px";
const CINZA_AZULADO = "#64748b";

type KpiCardsProps = {
  totals: DashboardTotals;
};

function KpiCards({ totals }: KpiCardsProps) {
  const kpis = [
    { label: "Títulos cadastrados", value: totals.titles, color: "#1A335B" },
    { label: "Exemplares no acervo", value: totals.copies, color: "#2f62e0" },
    { label: "Autores", value: totals.authors, color: "#0d9488" },
    {
      label: "Títulos sem estoque",
      value: totals.titles_without_stock,
      // Vermelho só quando há algo a resolver
      color: totals.titles_without_stock > 0 ? "#c62828" : "#15803d",
    },
  ];

  return (
    <section className="row g-3 mb-3">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="col-6 col-lg-3">
          <div
            className="bg-light shadow-lg p-3 p-lg-4 h-100"
            style={{ borderRadius: RAIO_CARD }}
          >
            <div
              className="fw-bold lh-1 mb-2"
              style={{
                color: kpi.color,
                fontSize: "clamp(1.8rem, 5vw, 2.75rem)",
              }}
            >
              {kpi.value.toLocaleString("pt-BR")}
            </div>
            <div className="small" style={{ color: CINZA_AZULADO }}>
              {kpi.label}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default KpiCards;
