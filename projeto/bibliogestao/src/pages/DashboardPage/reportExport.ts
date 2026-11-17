import type { AttentionBook } from "../../services/dashboardService";
import { attentionReasons } from "./dashboardMetrics";

// O Excel em português espera ponto e vírgula como separador
const SEPARATOR = ";";

function cell(value: string | number | null) {
  let text = String(value ?? "");

  // Texto que começa com = + - @ seria lido pelo Excel como fórmula
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  return `"${text.replace(/"/g, '""')}"`;
}

// Monta o conteúdo do CSV (separado do download para ficar fácil de testar)
export function buildAttentionCsv(books: AttentionBook[]) {
  const header = [
    "Título",
    "Autores",
    "ISBN",
    "Estoque",
    "Irrecuperáveis",
    "Precários",
    "Desgastados",
    "Situação",
  ];

  const rows = books.map((book) => [
    book.title,
    book.authors,
    book.isbn,
    book.stock_quantity,
    book.unusable,
    book.poor,
    book.worn,
    attentionReasons(book)
      .map((reason) => reason.label)
      .join(" · "),
  ]);

  // O BOM no começo faz o Excel abrir os acentos corretamente
  return (
    "\uFEFF" +
    [header, ...rows]
      .map((row) => row.map(cell).join(SEPARATOR))
      .join("\r\n")
  );
}

// Baixa a lista de títulos que precisam de ação como arquivo .csv
export function downloadAttentionCsv(books: AttentionBook[]) {
  const blob = new Blob([buildAttentionCsv(books)], {
    type: "text/csv;charset=utf-8",
  });

  // "2026-11-16" no fuso do usuário
  const today = new Date().toLocaleDateString("sv-SE");

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `acervo-precisa-de-acao-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}