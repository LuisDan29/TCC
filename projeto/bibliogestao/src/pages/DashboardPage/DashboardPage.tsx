import { useEffect, useState, type ReactNode } from "react";

import {
  getDashboardStats,
  type DashboardStats,
} from "../../services/dashboardService";
import ConditionsChart from "./ConditionsChart";
import DecadesChart from "./DecadesChart";
import KpiCards from "./KpiCards";
import MonthlyChart from "./MonthlyChart";
import RankingChart from "./RankingChart";

// Identidade visual: mesma da home
const CINZA_AZULADO = "#64748b";
const RAIO_CARD = "30px";

// Card branco com título, usado por todos os gráficos
type ChartCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div
      className="bg-light shadow-lg p-3 p-lg-4 h-100"
      style={{ borderRadius: RAIO_CARD }}
    >
      <h2 className="h5 fw-bold mb-1">{title}</h2>
      <p className="small mb-3" style={{ color: CINZA_AZULADO }}>
        {subtitle}
      </p>
      {children}
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const data = await getDashboardStats();

        if (!cancelled) setStats(data);
      } catch (error) {
        console.error("Erro ao carregar as estatísticas:", error);

        if (!cancelled) {
          setErrorMessage(
            "Não foi possível carregar as estatísticas do acervo.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <style>
        {`
          /* Fundo branco só nesta página (o menu continua azul-marinho) */
          .app-shell:has(.dashboard-page) {
            background-color: #fff !important;
          }
        `}
      </style>

      <main className="dashboard-page container py-4 py-lg-5">
        <header className="mb-4">
          <p className="mb-1" style={{ color: CINZA_AZULADO }}>
            Estatísticas do acervo
          </p>
          <h1
            className="fw-bold m-0"
            style={{
              color: "#0f1c35",
              fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
              letterSpacing: "-.01em",
            }}
          >
            Relatórios
          </h1>
        </header>

        {loading && (
          <p className="text-secondary">Carregando estatísticas...</p>
        )}

        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}

        {stats && (
          <>
            <KpiCards totals={stats.totals} />

            <section className="row g-3 mb-3">
              <div className="col-12 col-lg-6">
                <ChartCard
                  title="Exemplares por condição"
                  subtitle={`${stats.totals.copies} exemplares em ${stats.totals.titles} títulos`}
                >
                  <ConditionsChart data={stats.conditions} />
                </ChartCard>
              </div>

              <div className="col-12 col-lg-6">
                <ChartCard
                  title="Gêneros mais frequentes"
                  subtitle="Os 10 gêneros com mais títulos"
                >
                  <RankingChart
                    data={stats.top_genres}
                    color="#1A335B"
                    seriesName="Títulos"
                    ariaLabel="Gráfico de barras com os gêneros que têm mais títulos no acervo"
                    emptyMessage="Nenhum gênero cadastrado ainda."
                  />
                </ChartCard>
              </div>
            </section>

            <section className="row g-3 mb-3">
              <div className="col-12 col-lg-6">
                <ChartCard
                  title="Títulos por década"
                  subtitle="Ano de publicação dos livros do acervo"
                >
                  <DecadesChart data={stats.by_decade} />
                </ChartCard>
              </div>

              <div className="col-12 col-lg-6">
                <ChartCard
                  title="Autores mais frequentes"
                  subtitle="Os 10 autores com mais títulos"
                >
                  <RankingChart
                    data={stats.top_authors}
                    color="#0d9488"
                    seriesName="Títulos"
                    ariaLabel="Gráfico de barras com os autores que têm mais títulos no acervo"
                    emptyMessage="Nenhum autor cadastrado ainda."
                  />
                </ChartCard>
              </div>
            </section>

            <section className="row g-3">
              <div className="col-12">
                <ChartCard
                  title="Cadastros por mês"
                  subtitle="Livros cadastrados nos últimos 12 meses"
                >
                  <MonthlyChart data={stats.by_month} />
                </ChartCard>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}

export default DashboardPage;
