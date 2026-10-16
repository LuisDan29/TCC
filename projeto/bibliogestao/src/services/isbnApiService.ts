export async function getBookByISBN(isbn: string) {
  isbn = isbn.replace(/[\s-]/g, "").toUpperCase();

  const url = `https://brasilapi.com.br/api/isbn/v1/${isbn}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `A API retornou o erro HTTP ${response.status}. Tente novamente.`,
    );
  }

  return await response.json();
}
