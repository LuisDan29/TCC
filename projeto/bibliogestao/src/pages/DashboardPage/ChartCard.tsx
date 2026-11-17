import type { ReactNode } from "react";

import { CARD_STYLE, THEME } from "./dashboardTheme";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  // Conteúdo à direita do título (ex.: um selo ou um pequeno resumo)
  aside?: ReactNode;
  children: ReactNode;
};

// Cartão branco com título, usado por todos os gráficos do dashboard
function ChartCard({ title, subtitle, aside, children }: ChartCardProps) {
  return (
    <section className="p-3 p-lg-4 h-100 d-flex flex-column" style={CARD_STYLE}>
      <header className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h2 className="h6 fw-bold m-0" style={{ color: THEME.text }}>
            {title}
          </h2>
          {subtitle && (
            <p className="small m-0 mt-1" style={{ color: THEME.muted }}>
              {subtitle}
            </p>
          )}
        </div>
        {aside}
      </header>

      <div className="flex-grow-1">{children}</div>
    </section>
  );
}

export default ChartCard;
