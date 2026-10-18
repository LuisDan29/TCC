import { normalizeISBN } from "../utils/bookValidation";

export async function getBookByISBN(rawIsbn: string) {
  const isbn = normalizeISBN(rawIsbn);

  const url = `https://brasilapi.com.br/api/isbn/v1/${isbn}`;

  const response = await fetch(url);

  if (response.status === 400) {
    throw new Error(
      "A API considerou este ISBN inválido. Confira o número digitado.",
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Livro não encontrado para este ISBN. Preencha os dados manualmente.",
    );
  }

  if (!response.ok) {
    throw new Error(
      "Os serviços de consulta estão indisponíveis agora. Tente mais tarde ou preencha manualmente.",
    );
  }

  return await response.json();
}
