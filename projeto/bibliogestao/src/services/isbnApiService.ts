import { normalizeISBN } from "../utils/bookValidation";

const NOT_FOUND_MESSAGE =
  "Livro não encontrado para este ISBN. Preencha os dados manualmente.";

const UNEXPECTED_MESSAGE =
  "A API devolveu uma resposta inesperada. Preencha os dados manualmente.";

export type BookInfo = {
  title: string;
  subtitle: string;
  authors: string[];
  publisher: string;
  year: number | null;
  subjects: string[];
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}

export async function getBookByISBN(rawIsbn: string) {
  const isbn = normalizeISBN(rawIsbn);

  const url = `https://brasilapi.com.br/api/isbn/v1/${isbn}`;

  let response: Response;

  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  } catch (error) {
    console.error("Falha ao chamar a Brasil API:", error);

    throw new Error(
      "Não foi possível conectar à API. Verifique sua internet e tente novamente.",
    );
  }

  if (response.status === 400) {
    throw new Error(
      "A API considerou este ISBN inválido. Confira o número digitado.",
    );
  }

  if (response.status === 404) {
    throw new Error(NOT_FOUND_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(
      "Os serviços de consulta estão indisponíveis agora. Tente mais tarde ou preencha manualmente.",
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch (error) {
    console.error("A resposta da Brasil API não é um JSON válido:", error);
    throw new Error(UNEXPECTED_MESSAGE);
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error(UNEXPECTED_MESSAGE);
  }

  let raw = data as Record<string, unknown>;

  const title = toText(raw.title);

  if (!title) {
    throw new Error(NOT_FOUND_MESSAGE);
  }

  const rawYear = raw.year;
  const year =
    typeof rawYear === "number" && rawYear >= 1000 && rawYear <= 9999
      ? rawYear
      : null;

  return {
    title,
    subtitle: toText(raw.subtitle),
    authors: toList(raw.authors),
    publisher: toText(raw.publisher),
    year,
    subjects: toList(raw.subjects),
  };
}
