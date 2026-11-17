import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import newLogo from "../../assets/newLogo.png";
import { PATHS } from "../../routes/paths";
import {
  getAttentionBooks,
  getDashboardStats,
  type AttentionBook,
  type DashboardStats,
  type DashboardTotals,
} from "../../services/dashboardService";
import AttentionList from "./AttentionList";
import ChartCard from "./ChartCard";
import ConditionsChart from "./ConditionsChart";
import GrowthChart from "./GrowthChart";
import KpiCards from "./KpiCards";
import RankingChart from "./RankingChart";
import { formatNumber } from "./dashboardMetrics";
import { CARD_STYLE, THEME } from "./dashboardTheme";

function count(value: number, singular: string, plural: string) {
  return `${formatNumber(value)} ${value === 1 ? singular : plural}`;
}

// "128 títulos · 37 autores · 12 gêneros · 9 editoras"
function summaryLine(totals: DashboardTotals) {
  return [
    count(totals.titles, "título", "títulos"),
    count(totals.authors, "autor", "autores"),
    count(totals.genres, "gênero", "gêneros"),
    count(totals.publishers, "editora", "editoras"),
  ].join(" · ");
}

// Esqueleto mostrado só no primeiro carregamento
function DashboardSkeleton() {
  return (
    <div
      className="placeholder-glow"
      role="status"
      style={{ color: "#cbd5e1" }}
    >
      <span className="visually-hidden">Carregando estatísticas...</span>

      <div className="row g-3 mb-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="col-6 col-lg-3">
            <div className="p-3 p-lg-4" style={{ ...CARD_STYLE, height: 132 }}>
              <span className="placeholder col-7 mb-3 d-block" />
              <span className="placeholder placeholder-lg col-4" />
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <div style={{ ...CARD_STYLE, height: 420 }} />
        </div>
        <div className="col-12 col-xl-4">
          <div style={{ ...CARD_STYLE, height: 420 }} />
        </div>
      </div>
    </div>
  );
}

// Acervo sem nenhum livro: em vez de gráficos vazios, um convite para começar
function EmptyState() {
  return (
    <div className="p-4 p-lg-5 text-center" style={CARD_STYLE}>
      <h2 className="h5 fw-bold" style={{ color: THEME.text }}>
        Seu acervo ainda está vazio
      </h2>
      <p className="mb-4" style={{ color: THEME.muted }}>
        Cadastre o primeiro livro para ver as estatísticas aparecerem aqui.
      </p>
      <Link to={PATHS.booksNew} className="btn btn-primary">
        Cadastrar livro
      </Link>
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  // null = a lista "Precisa de ação" não carregou (o resto do painel funciona)
  const [attention, setAttention] = useState<AttentionBook[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    // Em paralelo; se só a lista falhar, o painel continua aparecendo
    const [statsResult, attentionResult] = await Promise.allSettled([
      getDashboardStats(),
      getAttentionBooks(),
    ]);

    if (statsResult.status === "fulfilled") {
      setStats(statsResult.value);
      setUpdatedAt(new Date());
      setErrorMessage("");
    } else {
      console.error("Erro ao carregar as estatísticas:", statsResult.reason);
      setErrorMessage("Não foi possível carregar as estatísticas do acervo.");
    }

    if (attentionResult.status === "fulfilled") {
      setAttention(attentionResult.value);
    } else {
      console.error("Erro ao carregar a lista:", attentionResult.reason);
      setAttention(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Atualizar mantém os gráficos na tela enquanto busca os dados novos
  function handleRefresh() {
    setLoading(true);
    fetchData();
  }

  const updatedTime = updatedAt?.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedFull = updatedAt?.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="report-page" style={{ backgroundColor: THEME.page, minHeight: "100vh" }}>
      <style>
        {`
          .print-only { display: none; }

          /* Relatório: "Gerar relatório" abre a impressão do navegador, onde
             o usuário escolhe "Salvar como PDF". Aqui escondemos o que não
             faz sentido no papel (menu lateral, botões) e ajustamos a folha. */
                    @media print {
            @page { size: A4; margin: 12mm; }

            .app-shell { display: block !important; background: #fff !important; }
            .app-shell .app-sidebar,
            .app-shell .app-topbar,
            .app-shell .app-backdrop,
            .no-print { display: none !important; }

            .print-only { display: block; }

            .report-page { background: #fff !important; min-height: 0 !important; }
            .report-page main { padding: 0 !important; max-width: none !important; }

            .report-page * {
              box-shadow: none !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* A grade responsiva do Bootstrap (colunas dentro de linhas
               flexíveis) quebra mal entre páginas. Na folha, os cartões
               entram numa grade simples: 4 cartões de resumo e, embaixo,
               uma grade de 2 colunas onde a lista e o crescimento ocupam
               a largura toda. */
            .report-page .h-100 { height: auto !important; }
            .report-page .table-responsive { overflow: visible !important; }
            .report-page section.flex-column { display: block !important; }

            .report-page section[aria-label="Resumo do acervo"],
            .report-grid {
              display: grid !important;
              gap: 12px;
              margin: 0 0 12px !important;
            }
            .report-page section[aria-label="Resumo do acervo"] {
              grid-template-columns: repeat(4, 1fr);
            }
            .report-grid { grid-template-columns: 1fr 1fr; }
            .report-grid > .row { display: contents !important; }

            .report-page section[aria-label="Resumo do acervo"] > *,
            .report-grid .row > * {
              width: auto !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .report-grid .print-full { grid-column: 1 / -1; }
            /* Cartões lado a lado ficam com a mesma altura */
            .report-grid .row > * > * { height: 100% !important; }

            /* Não corta um cartão (nem uma linha da tabela) ao meio */
            .report-page section[aria-label="Resumo do acervo"] > *,
            .report-grid .row > * > *,
            .report-page tr { break-inside: avoid; }
            .report-page thead { display: table-header-group; }
          }
        `}
      </style>

      <main
        className="container-fluid mx-auto px-3 px-lg-4 py-4 py-lg-5"
        style={{ maxWidth: 1400 }}
      >
        {/* Cabeçalho do relatório: só aparece na impressão */}
        <header
          className="print-only mb-4 pb-3"
          style={{ borderBottom: `2px solid ${THEME.navy}` }}
        >
          <div className="d-flex align-items-center gap-3">
            <img
              src={newLogo}
              alt=""
              style={{ width: 44, borderRadius: 10 }}
            />
            <div>
              <div
                className="fw-bold fs-4"
                style={{ color: THEME.navyDark }}
              >
                Relatório do acervo
              </div>
              <div className="small" style={{ color: THEME.muted }}>
                BiblioGestão
                {updatedFull && ` · dados de ${updatedFull}`}
                {stats && ` · ${summaryLine(stats.totals)}`}
              </div>
            </div>
          </div>
        </header>

        {/* Cabeçalho da tela */}
        <header className="no-print d-flex flex-column flex-sm-row justify-content-between align-items-sm-end gap-3 mb-4">
          <div>
            <h1
              className="fw-bold m-0"
              style={{
                color: THEME.navyDark,
                fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
                letterSpacing: "-.01em",
              }}
            >
              Dashboard
            </h1>
            <p className="m-0 pt-2" style={{ color: THEME.muted }}>
              {stats ? summaryLine(stats.totals) : "Estatísticas do acervo"}
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 gap-sm-3">
            {updatedTime && (
              <span className="small" style={{ color: THEME.muted }}>
                Atualizado às {updatedTime}
              </span>
            )}
            <button
              type="button"
              className="btn btn-outline-primary btn-sm px-3"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading && stats && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
              )}
              Atualizar
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm px-3"
              onClick={() => window.print()}
              disabled={!stats}
            >
              Gerar relatório
            </button>
          </div>
        </header>

        {errorMessage && (
          <div
            className="alert alert-danger d-flex justify-content-between align-items-center gap-3"
            role="alert"
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger no-print"
              onClick={handleRefresh}
              disabled={loading}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {loading && !stats && <DashboardSkeleton />}

        {stats && stats.totals.titles === 0 && <EmptyState />}

        {stats && stats.totals.titles > 0 && (
          <>
                        <KpiCards
              totals={stats.totals}
              conditions={stats.conditions}
              byMonth={stats.by_month}
            />

            <div className="report-grid">
              <section className="row g-3 mb-3">
                <div className="col-12 col-xl-8 print-full">
                  <AttentionList books={attention} />
                </div>

                <div className="col-12 col-xl-4">
                  <ChartCard
                    title="Estado dos exemplares"
                    subtitle={`${formatNumber(stats.totals.copies)} exemplares em ${count(stats.totals.titles, "título", "títulos")}`}
                  >
                    <ConditionsChart data={stats.conditions} />
                  </ChartCard>
                </div>
              </section>

              <section className="row g-3">
                <div className="col-12 col-xl-5">
                  <ChartCard
                    title="Gêneros mais frequentes"
                    subtitle="Os 8 gêneros com mais títulos"
                  >
                    <RankingChart
                      data={stats.top_genres.slice(0, 8)}
                      color={THEME.navy}
                      seriesName="Títulos"
                      ariaLabel="Gráfico de barras com os gêneros que têm mais títulos no acervo"
                      emptyMessage="Nenhum gênero cadastrado ainda."
                    />
                  </ChartCard>
                </div>

                <div className="col-12 col-xl-7 print-full">
                  <ChartCard
                    title="Crescimento do acervo"
                    subtitle="Títulos cadastrados por mês e total acumulado, nos últimos 12 meses"
                  >
                    <GrowthChart
                      totalTitles={stats.totals.titles}
                      byMonth={stats.by_month}
                    />
                  </ChartCard>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;