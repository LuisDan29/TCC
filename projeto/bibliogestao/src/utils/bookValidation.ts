export function validateISBN(isbn: string) {
  isbn = isbn.replace(/[\s-]/g, "").toUpperCase();

  if (isbn.length === 13) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const peso = i % 2 === 0 ? 1 : 3;
      sum += parseInt(isbn[i]) * peso;
    }

    const lastDigit = parseInt(isbn[12]);

    const remainder = sum % 10;
    const resultDigit = (10 - remainder) % 10;

    return lastDigit === resultDigit;
  }

  if (isbn.length === 10) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn[i]) * (10 - i);
    }

    const resultDigit = (11 - (sum % 11)) % 11;
    const lastDigit = isbn[9];

    if (resultDigit === 10) {
      return lastDigit === "X";
    } else {
      return lastDigit === resultDigit.toString();
    }
  }

  return false;
}

console.log(validateISBN("85-325-1101-X"));
