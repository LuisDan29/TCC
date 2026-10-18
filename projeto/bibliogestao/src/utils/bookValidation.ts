export function normalizeISBN(isbn: string): string {
  return isbn.replace(/[\s-]/g, "").toUpperCase();
}

export function validateISBN(rawIsbn: string): boolean {
  const isbn = normalizeISBN(rawIsbn);

  if (/^\d{13}$/.test(isbn)) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const peso = i % 2 === 0 ? 1 : 3;
      sum += parseInt(isbn[i]) * peso;
    }

    const lastDigit = parseInt(isbn[12]);
    const resultDigit = (10 - (sum % 10)) % 10;

    return lastDigit === resultDigit;
  }

  if (/^\d{9}[\dX]$/.test(isbn)) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn[i]) * (10 - i);
    }

    const resultDigit = (11 - (sum % 11)) % 11;
    const lastDigit = isbn[9];

    return resultDigit === 10
      ? lastDigit === "X"
      : lastDigit === resultDigit.toString();
  }

  return false;
}

export function validateStockQuantity(
  bookConditions: number[],
  numberBooksInserted: number,
): boolean {
  const totalDistributed = bookConditions.reduce(
    (total, quantity) => total + quantity,
    0,
  );

  return numberBooksInserted > 0 && totalDistributed === numberBooksInserted;
}
