export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    switch (error.code) {
      case "23505":
        return "Já existe um livro cadastrado com esse ISBN.";
      case "42501":
        return "Você não tem permissão pra realizar essa ação";
    }
  }

  if (error instanceof Error && /fetch|network/i.test(error.message)) {
    return "Ocorreu um erro de rede. Verifique sua conexão e tente novamente.";
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}
