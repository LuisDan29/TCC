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
