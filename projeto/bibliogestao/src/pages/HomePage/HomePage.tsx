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

// Identidade visual: mesma da tela de login
const BOTAO = "#1A335B";
const CINZA_AZULADO = "#64748b";
const RAIO_CARD = "30px";

// Gradiente do card "Cadastrar livro" (mantido)
const GRADIENTE_CADASTRO = "linear-gradient(160deg, #1b3a8f, #0f1f4d)";

const CORES_CAPA = [
  "#2f62e0",
  "#0f1f4d",
  "#7c3aed",
  "#0d9488",
  "#b45309",
  "#be123c",
];

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
    "align-items-lg-start justify-content-lg-center gap-3 bg-light border-0 " +
    "shadow-lg p-3 p-lg-4 text-start text-decoration-none";

  return (
    <>
      <style>
        {`
          /* Fundo branco só nesta página (o menu continua azul-marinho) */
          .app-shell:has(.home-page) {
            background-color: #fff !important;
          }

          .home-busca {
            border: 1px solid #dee2e6;
            transition: border-color .15s, box-shadow .15s;
          }

          .home-busca:focus-within {
            border-color: ${BOTAO};
            box-shadow: 0 0 0 .25rem rgba(26, 51, 91, .2);
          }

          .home-busca .form-control:focus {
            box-shadow: none;
          }

          .home-card-atalho {
            transition: box-shadow .15s;
          }

          .home-card-atalho:hover,
          .home-card-atalho:focus-visible {
            outline: 3px solid rgba(160, 174, 192, .55);
            outline-offset: 2px;
          }
        `}
      </style>

      <main className="home-page container py-4 py-lg-5">
        {/* 1. Cabeçalho */}
        <section className="mb-4">
          <p className="mb-1" style={{ color: CINZA_AZULADO }}>
            {saudacao()}, bibliotecário.
          </p>
          <h1
            className="fw-bold m-0"
            style={{
              color: "#0f1c35",
              fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
              letterSpacing: "-.01em",
            }}
          >
            O que você procura hoje?
          </h1>
        </section>

        {/* 2. Busca */}
        <form
          className="bg-light shadow-lg p-3 p-lg-4 d-flex flex-column flex-sm-row gap-3 mb-4"
          style={{ borderRadius: RAIO_CARD }}
          onSubmit={handleSearch}
          role="search"
        >
          <div className="home-busca d-flex align-items-center flex-grow-1 gap-2 bg-white rounded-4 px-3 text-secondary">
            <SearchIcon size={18} />
            <input
              type="search"
              className="form-control form-control-lg border-0 shadow-none bg-transparent px-0"
              placeholder="Título ou ISBN"
              aria-label="Pesquisar no acervo"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg px-5">
            Buscar
          </button>
        </form>

        {/* 3. Cadastro + atalhos */}
        <section className="row g-3 mb-4">
          <div className="col-12 col-lg-6">
            <div
              className="h-100 text-white p-4 d-flex flex-column justify-content-center gap-3 shadow-lg"
              style={{
                background: GRADIENTE_CADASTRO,
                borderRadius: RAIO_CARD,
                border: "1px solid rgba(255, 255, 255, .14)",
              }}
            >
              <div className="d-flex align-items-start gap-3">
                <span
                  className="d-inline-flex rounded-4 p-2"
                  style={{ background: "rgba(255, 255, 255, .12)" }}
                >
                  <BarcodeScanIcon size={28} />
                </span>

                <div>
                  <h2 className="h4 fw-bold mb-1">Cadastrar livro</h2>
                  <p className="mb-0" style={{ color: "#cdd6f0" }}>
                    Preencha os dados do livro para adicionar ao acervo.
                  </p>
                </div>
              </div>

              {isTouchScreen && (
                <>
                  <button
                    type="button"
                    className="btn btn-light fw-semibold py-3 d-flex justify-content-center align-items-center gap-2"
                    style={{ color: BOTAO }}
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
                className="btn btn-outline-light fw-semibold py-3 d-flex justify-content-center align-items-center gap-2"
              >
                <PlusIcon size={22} /> Cadastrar manualmente
              </Link>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <Link
              to={PATHS.books}
              className={cardAtalhoClasses}
              style={{ borderRadius: RAIO_CARD, color: BOTAO }}
            >
              <SearchIcon size={26} />
              <div className="flex-grow-1 d-flex flex-column">
                <strong className="text-dark">Consultar acervo</strong>
                <span className="small text-secondary">
                  Pesquise e encontre livros e autores
                </span>
              </div>
              <span className="d-lg-none">
                <ChevronRightIcon />
              </span>
            </Link>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <Link
              to={PATHS.dashboard}
              className={cardAtalhoClasses}
              style={{ borderRadius: RAIO_CARD, color: BOTAO }}
            >
              <BarChartIcon size={26} />
              <div className="flex-grow-1 d-flex flex-column">
                <strong className="text-dark">Relatórios</strong>
                <span className="small text-secondary">
                  Veja estatísticas do acervo
                </span>
              </div>
              <span className="d-lg-none">
                <ChevronRightIcon />
              </span>
            </Link>
          </div>
        </section>

        {/* 4. Últimos livros */}
        <section
          className="bg-light shadow-lg p-3 p-lg-4"
          style={{ borderRadius: RAIO_CARD }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 fw-bold m-0 d-flex align-items-center gap-2">
              <BookIcon size={22} /> Últimos livros cadastrados
            </h2>

            <Link
              to={`${PATHS.books}?view=all`}
              className="fw-semibold text-decoration-none text-nowrap ms-3"
              style={{ color: BOTAO }}
            >
              Ver todos
            </Link>
          </div>

          {loading && <p className="mb-0">Carregando livros...</p>}

          {errorMessage && (
            <div className="alert alert-danger mb-0">{errorMessage}</div>
          )}

          {!loading && !errorMessage && books.length === 0 && (
            <div className="text-center py-4 text-secondary">
              <p className="mb-3">Nenhum livro cadastrado ainda.</p>
              <Link
                to={PATHS.booksNew}
                className="btn btn-primary btn-lg d-inline-flex align-items-center gap-2"
              >
                <PlusIcon size={20} /> Cadastrar o primeiro livro
              </Link>
            </div>
          )}

          {!loading && !errorMessage && books.length > 0 && (
            <div className="table-responsive">
              <table
                className="table align-middle mb-0"
                style={{ "--bs-table-bg": "transparent" } as CSSProperties}
              >
                <thead>
                  <tr className="small">
                    <th className="fw-medium text-secondary">Livro</th>
                    <th className="fw-medium text-secondary d-none d-md-table-cell">
                      ISBN
                    </th>
                    <th className="fw-medium text-secondary d-none d-sm-table-cell">
                      Ano
                    </th>
                    <th className="fw-medium text-secondary text-end">Qtd.</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <span
                            className="d-inline-flex align-items-center justify-content-center text-white flex-shrink-0 rounded-2"
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
                            <small className="text-secondary">
                              {book.BookAuthors.map(
                                (item) => item.Authors?.full_name,
                              )
                                .filter(Boolean)
                                .join(", ") || "Autor não informado"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td className="d-none d-md-table-cell small text-secondary">
                        {book.isbn}
                      </td>

                      <td className="d-none d-sm-table-cell small text-secondary">
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
    </>
  );
}

export default HomePage;
