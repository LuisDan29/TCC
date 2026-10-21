import type { AdvancedBookFilters } from "../services/bookService";

function isNonNegativeInteger(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

// Retorna true se existir pelo menos um filtro avançado preenchido.
export function hasActiveFilters(filters: AdvancedBookFilters): boolean {
  return (
    filters.authorIds.length > 0 ||
    filters.genreIds.length > 0 ||
    filters.publisherId !== "" ||
    filters.yearExact.trim() !== "" ||
    filters.yearFrom.trim() !== "" ||
    filters.yearTo.trim() !== "" ||
    filters.language.trim() !== "" ||
    filters.availability !== "all" ||
    filters.minStock.trim() !== "" ||
    filters.maxStock.trim() !== "" ||
    filters.createdFrom !== "" ||
    filters.createdTo !== ""
  );
}

// Retorna a mensagem do primeiro erro encontrado, ou null se tudo estiver válido.
export function validateAdvancedFilters(
  filters: AdvancedBookFilters,
): string | null {
  const hasExactYear = filters.yearExact.trim() !== "";
  const hasYearRange =
    filters.yearFrom.trim() !== "" || filters.yearTo.trim() !== "";

  if (hasExactYear && hasYearRange) {
    return "Use o ano exato ou o intervalo de anos, não os dois ao mesmo tempo.";
  }

  for (const year of [filters.yearExact, filters.yearFrom, filters.yearTo]) {
    if (year.trim() !== "" && !isNonNegativeInteger(year)) {
      return "Os anos devem ser números inteiros válidos.";
    }
  }

  if (
    filters.yearFrom.trim() !== "" &&
    filters.yearTo.trim() !== "" &&
    Number(filters.yearFrom) > Number(filters.yearTo)
  ) {
    return "O ano inicial não pode ser maior que o ano final.";
  }

  for (const stock of [filters.minStock, filters.maxStock]) {
    if (stock.trim() !== "" && !isNonNegativeInteger(stock)) {
      return "O estoque mínimo e o máximo devem ser números inteiros não negativos.";
    }
  }

  if (
    filters.minStock.trim() !== "" &&
    filters.maxStock.trim() !== "" &&
    Number(filters.minStock) > Number(filters.maxStock)
  ) {
    return "O estoque mínimo não pode ser maior que o máximo.";
  }

  if (
    filters.createdFrom !== "" &&
    filters.createdTo !== "" &&
    filters.createdFrom > filters.createdTo
  ) {
    return "A data inicial de cadastro não pode ser posterior à data final.";
  }

  return null;
}
