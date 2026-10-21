export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    switch (error.code) {
      case "23505":
        return "Já existe um livro cadastrado com esse ISBN.";
      case "42501":
        return "Você não tem permissão pra realizar essa ação";
      case "P0002":
        return "Livro não encontrado ou sem permissão para alterá-lo. Atualize a página e tente novamente.";
      case "23503":
        return "Não foi possível concluir: existem registros vinculados a este livro.";
      case "22023":
        return "As quantidades informadas são inválidas.";
    }
  }

  if (error instanceof Error && /fetch|network/i.test(error.message)) {
    return "Ocorreu um erro de rede. Verifique sua conexão e tente novamente.";
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}
