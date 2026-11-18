export function cleanList(values: string[]): string[] {
  const unique = new Map<string, string>();

  for (const value of values) {
    const clean = value.trim().replace(/\s+/g, " ");
    if (!clean) continue;

    const key = clean.toLocaleLowerCase("pt-BR");
    if (!unique.has(key)) unique.set(key, clean);
  }

  return [...unique.values()];
}

// Remove espaços sobrando e aplica a forma Unicode NFC. O banco compara os
// nomes caractere por caractere, então "é" decomposto viraria autor duplicado.
export function normalizeName(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/g, " ");
}

// Verdadeiro para nomes no padrão de catalogação: "ASSIS, Machado de"
// (sobrenome em maiúsculas, vírgula e o restante do nome).
export function isCatalogFormat(name: string): boolean {
  const clean = normalizeName(name);
  const commaIndex = clean.indexOf(",");

  if (commaIndex <= 0) return false;

  const surname = clean.slice(0, commaIndex).trim();
  const rest = clean.slice(commaIndex + 1).trim();

  if (!/\p{L}/u.test(surname) || !/\p{L}/u.test(rest)) return false;

  return surname === surname.toLocaleUpperCase("pt-BR");
}

// Monta "SOBRENOME, Restante" a partir de partes já identificadas.
// Só o sobrenome vai para maiúsculas; o restante mantém a grafia original.
export function formatCatalogName(surname: string, rest: string): string {
  return `${normalizeName(surname).toLocaleUpperCase("pt-BR")}, ${normalizeName(rest)}`;
}
