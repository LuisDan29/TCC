import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";

import { getRecentBooks, type BookListItem } from "../../services/bookService";
import {
  BarChartIcon,
  BarcodeScanIcon,
  BookIcon,
  CameraIcon,
  ChevronRightIcon,
  PlusIcon,
  SearchIcon,
} from "./HomeIcons";

// Paleta da Home
const AZUL = "#2f62e0";
const AZUL_ESCURO = "#0f1f4d";
const FUNDO = "#f5f7fc";
const TEXTO = "#14204a";
const TEXTO_SUAVE = "#5d6a8a";
const BORDA = "#e3e8f4";

const CORES_CAPA = [
  "#2f62e0",
  "#0f1f4d",
  "#7c3aed",
  "#0d9488",
  "#b45309",
  "#be123c",
];

// Deixa o .btn-primary do Bootstrap com o azul da Home
const botaoAzul = {
  "--bs-btn-bg": AZUL,
  "--bs-btn-border-color": AZUL,
  "--bs-btn-hover-bg": "#2552c4",
  "--bs-btn-hover-border-color": "#2552c4",
  "--bs-btn-active-bg": "#2552c4",
  "--bs-btn-active-border-color": "#2552c4",
  "--bs-btn-color": "#fff",
  "--bs-btn-hover-color": "#fff",
} as CSSProperties;

const LIVROS_NA_HOME = 5;

function saudacao() {
  const hora = new Date().getHours();

  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function HomePage() {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // O botão de escanear só aparece em telas de toque (celular/tablet)
  const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    let cancelled = false;

    async function loadRecentBooks() {
      try {
        const recentBooks = await getRecentBooks("newest");

        if (!cancelled) setBooks(recentBooks.slice(0, LIVROS_NA_HOME));
      } catch (error) {
        console.error("Erro ao carregar os últimos livros:", error);

        if (!cancelled) {
          setErrorMessage("Não foi possível carregar os últimos livros.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRecentBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearch(event: FormEvent) {
    event.preventDefault();

    const text = searchText.trim();

    // A página de pesquisa lê o texto pelo parâmetro "q"
    navigate(
      text ? `${PATHS.books}?q=${encodeURIComponent(text)}` : PATHS.books,
    );
  }

  const cardAtalhoClasses =
    "home-card-atalho h-100 w-100 d-flex align-items-center flex-lg-column " +
    "align-items-lg-start justify-content-lg-center gap-3 bg-white border " +
    "rounded-4 p-3 p-lg-4 text-start text-decoration-none";

  return (
    <>
      <style>
        {`
          .home-busca:focus-within {
            border-color: ${AZUL} !important;
            box-shadow: 0 0 0 3px rgba(47, 98, 224, .15);
          }

          .home-card-atalho {
            transition: border-color .15s, box-shadow .15s;
          }

          .home-card-atalho:hover,
          .home-card-atalho:focus-visible {
            border-color: #b8c8f2 !important;
            box-shadow: 0 6px 18px rgba(47, 98, 224, .1);
          }
        `}
      </style>

      <div
        style={{
          backgroundColor: FUNDO,
          color: TEXTO,
          minHeight: "calc(100vh - 56px)",
        }}
      >
        <main className="container py-4 py-lg-5">
          {/* 1. Cabeçalho */}
          <section className="mb-4">
            <p className="mb-1" style={{ color: TEXTO_SUAVE }}>
              {saudacao()}, bibliotecário.
            </p>
            <h1
              className="fw-bold m-0"
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
                letterSpacing: "-.01em",
              }}
            >
              O que você procura hoje?
            </h1>
          </section>

          {/* 2. Busca */}
          <form
            className="d-flex flex-column flex-sm-row gap-2 mb-4"
            onSubmit={handleSearch}
            role="search"
          >
            <div
              className="home-busca d-flex align-items-center flex-grow-1 gap-2 bg-white border rounded-3 px-3"
              style={{ borderColor: BORDA, color: TEXTO_SUAVE }}
            >
              <SearchIcon size={18} />
              <input
                type="search"
                className="form-control border-0 shadow-none bg-transparent px-0 py-3"
                style={{ color: TEXTO }}
                placeholder="Título ou ISBN"
                aria-label="Pesquisar no acervo"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary rounded-3 fw-semibold px-5 py-3"
              style={botaoAzul}
            >
              Buscar
            </button>
          </form>

          {/* 3. Cadastro + atalhos */}
          <section className="row g-3 mb-4">
            <div className="col-12 col-lg-6">
              <div
                className="h-100 text-white rounded-4 p-4 d-flex flex-column justify-content-center gap-3"
                style={{
                  background: `linear-gradient(160deg, #1b3a8f, ${AZUL_ESCURO})`,
                }}
              >
                <div className="d-flex align-items-start gap-3">
                  <span
                    className="d-inline-flex rounded-3 p-2"
                    style={{ background: "rgba(255, 255, 255, .12)" }}
                  >
                    <BarcodeScanIcon size={28} />
                  </span>

                  <div>
                    <h2 className="h4 fw-semibold mb-1">Cadastrar livro</h2>
                    <p className="mb-0" style={{ color: "#cdd6f0" }}>
                      Preencha os dados do livro para adicionar ao acervo.
                    </p>
                  </div>
                </div>

                {isTouchScreen && (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary rounded-3 fw-semibold py-3 d-flex justify-content-center align-items-center gap-2"
                      style={botaoAzul}
                      onClick={() =>
                        navigate(PATHS.booksNew, { state: { scan: true } })
                      }
                    >
                      <CameraIcon size={20} /> Escanear ISBN
                    </button>

                    <div
                      className="d-flex align-items-center gap-3 small"
                      style={{ color: "#cdd6f0" }}
                    >
                      <span
                        className="flex-grow-1"
                        style={{
                          height: 1,
                          background: "rgba(255, 255, 255, .25)",
                        }}
                      />
                      ou
                      <span
                        className="flex-grow-1"
                        style={{
                          height: 1,
                          background: "rgba(255, 255, 255, .25)",
                        }}
                      />
                    </div>
                  </>
                )}

                <Link
                  to={PATHS.booksNew}
                  className="btn btn-outline-light rounded-3 fw-semibold py-3 d-flex justify-content-center align-items-center gap-2"
                >
                  <PlusIcon size={22} /> Cadastrar manualmente
                </Link>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <Link
                to={PATHS.books}
                className={cardAtalhoClasses}
                style={{ borderColor: BORDA, color: AZUL }}
              >
                <SearchIcon size={26} />
                <div className="flex-grow-1 d-flex flex-column">
                  <strong style={{ color: TEXTO }}>Consultar acervo</strong>
                  <span className="small" style={{ color: TEXTO_SUAVE }}>
                    Pesquise e encontre livros e autores
                  </span>
                </div>
                <span className="d-lg-none">
                  <ChevronRightIcon />
                </span>
              </Link>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              {/* TODO: ligar quando a página de relatórios existir */}
              <button
                type="button"
                className={cardAtalhoClasses}
                style={{ borderColor: BORDA, color: AZUL }}
              >
                <BarChartIcon size={26} />
                <div className="flex-grow-1 d-flex flex-column">
                  <strong style={{ color: TEXTO }}>Relatórios</strong>
                  <span className="small" style={{ color: TEXTO_SUAVE }}>
                    Veja estatísticas do acervo
                  </span>
                </div>
                <span className="d-lg-none">
                  <ChevronRightIcon />
                </span>
              </button>
            </div>
          </section>

          {/* 4. Últimos livros */}
          <section
            className="bg-white border rounded-4 p-3 p-lg-4"
            style={{ borderColor: BORDA }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-semibold m-0 d-flex align-items-center gap-2">
                <BookIcon size={22} /> Últimos livros cadastrados
              </h2>

              <Link
                to={`${PATHS.books}?view=all`}
                className="fw-medium text-decoration-none"
                style={{ color: AZUL }}
              >
                Ver todos
              </Link>
            </div>

            {loading && <p className="mb-0">Carregando livros...</p>}

            {errorMessage && (
              <div className="alert alert-danger mb-0">{errorMessage}</div>
            )}

            {!loading && !errorMessage && books.length === 0 && (
              <div className="text-center py-4" style={{ color: TEXTO_SUAVE }}>
                <p className="mb-3">Nenhum livro cadastrado ainda.</p>
                <Link
                  to={PATHS.booksNew}
                  className="btn btn-primary rounded-3 fw-semibold d-inline-flex align-items-center gap-2"
                  style={botaoAzul}
                >
                  <PlusIcon size={20} /> Cadastrar o primeiro livro
                </Link>
              </div>
            )}

            {!loading && !errorMessage && books.length > 0 && (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr className="small">
                      <th
                        className="fw-medium"
                        style={{ backgroundColor: FUNDO, color: TEXTO_SUAVE }}
                      >
                        Livro
                      </th>
                      <th
                        className="fw-medium d-none d-md-table-cell"
                        style={{ backgroundColor: FUNDO, color: TEXTO_SUAVE }}
                      >
                        ISBN
                      </th>
                      <th
                        className="fw-medium d-none d-sm-table-cell"
                        style={{ backgroundColor: FUNDO, color: TEXTO_SUAVE }}
                      >
                        Ano
                      </th>
                      <th
                        className="fw-medium text-end"
                        style={{ backgroundColor: FUNDO, color: TEXTO_SUAVE }}
                      >
                        Qtd.
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id} style={{ borderColor: BORDA }}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <span
                              className="d-inline-flex align-items-center justify-content-center text-white flex-shrink-0 rounded-1"
                              style={{
                                width: 44,
                                height: 62,
                                backgroundColor:
                                  CORES_CAPA[book.id % CORES_CAPA.length],
                                boxShadow: "0 2px 6px rgba(0, 0, 0, .2)",
                              }}
                            >
                              <BookIcon size={22} />
                            </span>

                            <div style={{ minWidth: 0 }}>
                              <div className="fw-semibold">{book.title}</div>
                              <small style={{ color: TEXTO_SUAVE }}>
                                {book.BookAuthors.map(
                                  (item) => item.Authors?.full_name,
                                )
                                  .filter(Boolean)
                                  .join(", ") || "Autor não informado"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td
                          className="d-none d-md-table-cell small"
                          style={{ color: TEXTO_SUAVE }}
                        >
                          {book.isbn}
                        </td>

                        <td
                          className="d-none d-sm-table-cell small"
                          style={{ color: TEXTO_SUAVE }}
                        >
                          {book.publication_year ?? "—"}
                        </td>

                        <td className="text-end fw-semibold">
                          {book.stock_quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

export default HomePage;
