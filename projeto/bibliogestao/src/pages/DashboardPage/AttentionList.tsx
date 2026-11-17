import { BOOK_CONDITIONS } from "../../constants/bookConditions";
import type { AttentionBook } from "../../services/dashboardService";
import ChartCard from "./ChartCard";
import {
  attentionReasons,
  formatNumber,
  type AttentionReason,
} from "./dashboardMetrics";
import { THEME } from "./dashboardTheme";
import { downloadAttentionCsv } from "./reportExport";

// Quantos títulos aparecem na tela; a lista completa vai no CSV
const MAX_ROWS = 8;

// Cor do selo de cada situação (as condições usam as mesmas cores do resto do sistema)
const REASON_COLORS: Record<AttentionReason["kind"], string> = {
  no_stock: THEME.navyDark,
  unusable: BOOK_CONDITIONS[0].color,
  poor: BOOK_CONDITIONS[1].color,
  worn: BOOK_CONDITIONS[2].color,
};

function titlesLabel(total: number) {
  return `${formatNumber(total)} ${total === 1 ? "título" : "títulos"}`;
}

type AttentionListProps = {
  // null = não foi possível carregar a lista
  books: AttentionBook[] | null;
};

// Lista dos títulos que precisam de reposição, conserto ou descarte
function AttentionList({ books }: AttentionListProps) {
  const total = books?.length ?? 0;
  const visible = books?.slice(0, MAX_ROWS) ?? [];
  const hidden = total - visible.length;

  const subtitle =
    books === null
      ? undefined
      : total === 0
        ? "Nenhuma pendência no acervo"
        : `${titlesLabel(total)} sem estoque ou com exemplares em estado ruim`;

  return (
    <ChartCard
      title="Precisa de ação"
      subtitle={subtitle}
      aside={
        books && total > 0 ? (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm text-nowrap no-print"
            onClick={() => downloadAttentionCsv(books)}
          >
            Exportar CSV
          </button>
        ) : null
      }
    >
      {books === null && (
        <p className="text-secondary mb-0">
          Não foi possível carregar esta lista.
        </p>
      )}

      {books && total === 0 && (
        <div
          className="d-flex align-items-center gap-3 p-3"
          style={{ backgroundColor: "#f0fdf4", borderRadius: 16 }}
        >
          <span
            aria-hidden="true"
            style={{ color: THEME.good, fontSize: 24, lineHeight: 1 }}
          >
            ✓
          </span>
          <div>
            <div className="fw-semibold" style={{ color: THEME.good }}>
              Tudo em ordem
            </div>
            <div className="small" style={{ color: THEME.muted }}>
              Nenhum título sem estoque ou com exemplares em estado ruim.
            </div>
          </div>
        </div>
      )}

      {books && total > 0 && (
        <>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr className="small text-uppercase" style={{ color: THEME.muted }}>
                  <th scope="col" className="fw-semibold border-0 ps-0">
                    Título
                  </th>
                  <th scope="col" className="fw-semibold border-0 text-end">
                    Estoque
                  </th>
                  <th scope="col" className="fw-semibold border-0">
                    Situação
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((book) => (
                  <tr key={book.id}>
                    {/* max-width 0 + width em %: faz o texto longo ser cortado com "…" */}
                    <td className="ps-0" style={{ maxWidth: 0, width: "50%" }}>
                      <div
                        className="fw-semibold text-truncate"
                        title={book.title}
                        style={{ color: THEME.text }}
                      >
                        {book.title}
                      </div>
                      {book.authors && (
                        <div
                          className="small text-truncate"
                          title={book.authors}
                          style={{ color: THEME.muted }}
                        >
                          {book.authors}
                        </div>
                      )}
                    </td>
                    <td
                      className="text-end fw-semibold"
                      style={{
                        color:
                          book.stock_quantity === 0
                            ? THEME.danger
                            : THEME.text,
                      }}
                    >
                      {formatNumber(book.stock_quantity)}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {attentionReasons(book).map((reason) => (
                          <span
                            key={reason.kind}
                            className="badge rounded-pill fw-semibold"
                            style={{ backgroundColor: REASON_COLORS[reason.kind] }}
                          >
                            {reason.label}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hidden > 0 && (
            <p className="small mt-3 mb-0" style={{ color: THEME.muted }}>
              e mais {titlesLabel(hidden)}. A lista completa está no CSV.
            </p>
          )}
        </>
      )}
    </ChartCard>
  );
}

export default AttentionList;