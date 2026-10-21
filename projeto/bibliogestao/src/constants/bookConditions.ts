// Condições dos exemplares. O "number" é o índice usado nas chaves
// condition_0 ... condition_5 do campo `conditions` da tabela Books
// (mesmo mapeamento usado em createBook e no formulário de cadastro).
export const BOOK_CONDITIONS = [
  {
    number: 0,
    name: "Irrecuperável",
    description: "Sem condição de uso.",
  },
  {
    number: 1,
    name: "Precária",
    description: "Apresenta muitos sinais de uso e danos.",
  },
  {
    number: 2,
    name: "Desgastado",
    description: "Apresenta sinais de desgaste.",
  },
  {
    number: 3,
    name: "Regular",
    description: "Condição aceitável, com sinais normais de uso.",
  },
  {
    number: 4,
    name: "Bem conservado",
    description: "Pouco sinais de uso, ótimo estado.",
  },
  {
    number: 5,
    name: "Novo",
    description: "Sem sinais de uso.",
  },
];

// Converte o objeto { condition_0: 2, condition_1: 0, ... } do banco
// em um array [2, 0, ...] com uma posição por condição.
export function conditionsToArray(
  conditions: Record<string, number> | null | undefined,
): number[] {
  return BOOK_CONDITIONS.map((condition) =>
    Number(conditions?.[`condition_${condition.number}`] ?? 0),
  );
}
