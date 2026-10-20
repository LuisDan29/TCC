import { useEffect, useState } from "react";
import {
    getRecentBooks,
    getAllBooks,
    searchBooks,
    getBookFilterOptions,
    type AdvancedBookFilters,
    type BookFilterOptions,
} from "../../services/bookService";

interface Book {
    id: number;
    title: string;
    isbn: string;
    publication_year: number | null;
    stock_quantity: number;
    created_at: string;
    BookAuthors: {
        Authors: {
            full_name: string;
        } | null;
    }[];
}

function SearchPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchText, setSearchText] = useState("");    
    const [viewMode, setViewMode] = useState<"recent" | "all"> ("recent");
    const [sortMode, setSortMode] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageInput, setPageInput] = useState("1");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [authorSearch, setAuthorSearch] = useState("");
    const [genreSearch, setGenreSearch] = useState("");
    const [publisherSearch, setPublisherSearch] = useState("");
    const [languageSearch, setLanguageSearch] = useState("");
    const [showAuthorOptions, setShowAuthorOptions] = useState(false);
    const [showGenreOptions, setShowGenreOptions] = useState(false);
    const [showPublisherOptions, setShowPublisherOptions] = useState(false);
    const [showLanguageOptions, setShowLanguageOptions] = useState(false);
    
    const [draftFilters, setDraftFilters] =
        useState<AdvancedBookFilters>({
            authorIds: [],
            genreIds: [],
            publisherId: "",
            yearExact: "",
            yearFrom: "",
            yearTo: "",
            language: "",
            availability: "all",
            minStock: "",
            maxStock: "",
            createdFrom: "",
            createdTo: "",
        });

    const [appliedFilters, setAppliedFilters] =
        useState<AdvancedBookFilters>({
            authorIds: [],
            genreIds: [],
            publisherId: "",
            yearExact: "",
            yearFrom: "",
            yearTo: "",
            language: "",
            availability: "all",
            minStock: "",
            maxStock: "",
            createdFrom: "",
            createdTo: "",
        });

    const [filterOptions, setFilterOptions] = useState<BookFilterOptions>({
        authors: [],
        genres: [],
        publishers: [],
    });

    const filteredAuthors = filterOptions.authors
    .filter((author) =>
        author.full_name
            .toLowerCase()
            .includes(authorSearch.toLowerCase())
    )
    .sort((a, b) => a.full_name.localeCompare(b.full_name, "pt-BR"));

    const filteredGenres = filterOptions.genres
        .filter((genre) =>
            genre.name
                .toLowerCase()
                .includes(genreSearch.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    const filteredPublishers = filterOptions.publishers
        .filter((publisher) =>
            publisher.name
                .toLowerCase()
                .includes(publisherSearch.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    const pageSize = 20;
    const totalPages = Math.ceil(totalCount / pageSize);
    const pageInputNumber = Number(pageInput);
    const isPageInputInvalid =
        pageInput.trim() === "" ||
        !Number.isInteger(pageInputNumber) ||
        pageInputNumber < 1 ||
        pageInputNumber > totalPages;

    function goToPage(page: number) {
        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);
        setPageInput(String(page));
    }

    function handlePageInputChange(value: string) {
        setPageInput(value);
    }

    useEffect(() => {
        let cancelled = false;
        
        async function loadBooks() {
            setLoading(true);
            setErrorMessage("");

            try {
                let loadedBooks: Book[] = [];
                let loadedTotalCount = 0;

                if (searchText.trim()) {
                    const result = await searchBooks(
                        searchText,
                        sortMode,
                        currentPage
                    );

                    loadedBooks = result.books;
                    loadedTotalCount = result.totalCount;

                } else if (viewMode === "all") {
                    const result = await getAllBooks(
                        sortMode,
                        currentPage
                    );

                    loadedBooks = result.books;
                    loadedTotalCount = result.totalCount;

                } else {
                    loadedBooks = await getRecentBooks(sortMode);
                    loadedTotalCount = loadedBooks.length;
                }

                if (!cancelled) {
                    setBooks(loadedBooks);
                    setTotalCount(loadedTotalCount);
                }                                
            } catch (error) {
                console.error("Erro ao carregar livros: ", error);

                if (!cancelled) {
                    setErrorMessage("Não foi possível carregar os livros.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
                
        loadBooks();

        return () => {
            cancelled = true;
        };
    }, [searchText, viewMode, sortMode, currentPage]);

    useEffect(() => {
        async function loadFilterOptions() {
            try {
                const options = await getBookFilterOptions();
                setFilterOptions(options);
            } catch (error) {
                console.error("Erro ao carregar opções dos filtros:", error);
            }
        }

        loadFilterOptions();
    }, []);

    return (
        <main className="container py-4">
            <h1>Pesquisar livros</h1>

            <div className="mb-4">
                <input
                    type="search"
                    className="form-control"
                    placeholder="Pesquisar por título ou ISBN..."
                    value={searchText}
                    onChange={(event) => {
                        setSearchText(event.target.value);
                        setCurrentPage(1);
                        setPageInput("1");
                    }}
                />
            </div>

            <h2 className="h6 fw-semibold mb-2">
                Visualização do catálogo
            </h2>
            <div className="d-flex gap-2 mb-4">
                <button
                    type="button"
                    className={`btn rounded-pill flex-fill ${
                        !searchText.trim() && viewMode === "recent"
                            ? "btn-primary"
                            : "btn-outline-primary"
                    }`}
                    onClick={() => {
                        setViewMode("recent");
                        setSearchText("");
                        setCurrentPage(1);
                        setPageInput("1");
                    }}
                >
                    Últimos Cadastros
                </button>
                <button
                    type="button"
                    className={`btn rounded-pill flex-fill ${
                        !searchText.trim() && viewMode === "all"
                            ? "btn-primary"
                            : "btn-outline-primary"
                    }`}
                    onClick={() => {
                        setViewMode("all");
                        setSearchText("");
                        setCurrentPage(1);
                        setPageInput("1");
                    }}
                >
                    Todos os livros
                </button>
            </div>
            <div className="mb-3">
                <button
                    type="button"
                    className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                    <span>Filtros avançados</span>
                    <span aria-hidden="true">
                        {showAdvancedFilters ? "−" : "+"}
                    </span>
                </button>

                {showAdvancedFilters && (
                    <div className="mt-3">                        
                        <div className="card card-body">
                            <div className="row g-3">
                                {/* Autor */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="filterAuthorsSearch" className="form-label">
                                        Autor
                                    </label>

                                    <input
                                        id="filterAuthorsSearch"
                                        type="search"
                                        className="form-control mb-2"
                                        placeholder="Pesquisar autor..."
                                        value={authorSearch}
                                        onChange={(event) => {
                                            setAuthorSearch(event.target.value);
                                            setShowAuthorOptions(true);
                                        }}
                                        onFocus={() => setShowAuthorOptions(true)}
                                    />

                                    {showAuthorOptions && (
                                        <div
                                            className="border rounded p-2"
                                            style={{ maxHeight: "180px", overflowY: "auto" }}
                                        >
                                            {filteredAuthors.map((author) => (
                                                <label
                                                    key={author.id}
                                                    className="d-flex align-items-center gap-2 py-1"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input mt-0"
                                                        checked={draftFilters.authorIds.includes(author.id)}
                                                        onChange={(event) => {
                                                            setDraftFilters((previous) => ({
                                                                ...previous,
                                                                authorIds: event.target.checked
                                                                    ? [...previous.authorIds, author.id]
                                                                    : previous.authorIds.filter(
                                                                        (id) => id !== author.id
                                                                    ),
                                                            }));
                                                        }}
                                                    />
                                                    <span>{author.full_name}</span>
                                                </label>
                                            ))}

                                            {filteredAuthors.length === 0 && (
                                                <p className="small text-muted mb-0">
                                                    Nenhum autor encontrado.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="form-text">
                                        Pesquise e marque um ou mais autores.
                                    </div>
                                </div>

                                {/* Gênero */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="filterGenresSearch" className="form-label">
                                        Gênero literário
                                    </label>

                                    <input
                                        id="filterGenresSearch"
                                        type="search"
                                        className="form-control mb-2"
                                        placeholder="Pesquisar gênero..."
                                        value={genreSearch}
                                        onChange={(event) => {
                                            setGenreSearch(event.target.value);
                                            setShowGenreOptions(true);
                                        }}
                                        onFocus={() => setShowGenreOptions(true)}
                                    />

                                    {showGenreOptions && (
                                        <div
                                            className="border rounded p-2"
                                            style={{ maxHeight: "180px", overflowY: "auto" }}
                                        >
                                            {filteredGenres.map((genre) => (
                                                <label
                                                    key={genre.id}
                                                    className="d-flex align-items-center gap-2 py-1"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input mt-0"
                                                        checked={draftFilters.genreIds.includes(genre.id)}
                                                        onChange={(event) => {
                                                            setDraftFilters((previous) => ({
                                                                ...previous,
                                                                genreIds: event.target.checked
                                                                    ? [...previous.genreIds, genre.id]
                                                                    : previous.genreIds.filter(
                                                                        (id) => id !== genre.id
                                                                    ),
                                                            }));
                                                        }}
                                                    />
                                                    <span>{genre.name}</span>
                                                </label>
                                            ))}

                                            {filteredGenres.length === 0 && (
                                                <p className="small text-muted mb-0">
                                                    Nenhum gênero encontrado.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="form-text">
                                        Serão considerados livros de qualquer gênero selecionado.
                                    </div>
                                </div>

                                {/* Editora */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="filterPublisherSearch" className="form-label">
                                        Editora
                                    </label>

                                    <input
                                        id="filterPublisherSearch"
                                        type="search"
                                        className="form-control mb-2"
                                        placeholder="Pesquisar editora..."
                                        value={publisherSearch}
                                        onChange={(event) => {
                                            setPublisherSearch(event.target.value);
                                            setShowPublisherOptions(true);
                                        }}
                                        onFocus={() => setShowPublisherOptions(true)}
                                    />

                                    {showPublisherOptions && (
                                        <div
                                            className="border rounded p-2"
                                            style={{ maxHeight: "180px", overflowY: "auto" }}
                                        >
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary w-100 text-start mb-1"
                                                onClick={() => {
                                                    setDraftFilters((previous) => ({
                                                        ...previous,
                                                        publisherId: "",
                                                    }));
                                                    setPublisherSearch("");
                                                    setShowPublisherOptions(false);
                                                }}
                                            >
                                                Todas as editoras
                                            </button>

                                            {filteredPublishers.map((publisher) => (
                                                <button
                                                    key={publisher.id}
                                                    type="button"
                                                    className={`btn btn-sm w-100 text-start ${
                                                        draftFilters.publisherId === String(publisher.id)
                                                            ? "btn-primary"
                                                            : "btn-light"
                                                    }`}
                                                    onClick={() => {
                                                        setDraftFilters((previous) => ({
                                                            ...previous,
                                                            publisherId: String(publisher.id),
                                                        }));
                                                        setPublisherSearch(publisher.name);
                                                        setShowPublisherOptions(false);
                                                    }}
                                                >
                                                    {publisher.name}
                                                </button>
                                            ))}

                                            {filteredPublishers.length === 0 && (
                                                <p className="small text-muted mb-0">
                                                    Nenhuma editora encontrada.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Idioma */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="filterLanguage" className="form-label">
                                        Idioma
                                    </label>
                                    <input
                                        id="filterLanguage"
                                        type="text"
                                        className="form-control"
                                        placeholder="Ex.: Português"
                                        value={draftFilters.language}
                                        onChange={(event) =>
                                            setDraftFilters((previous) => ({
                                                ...previous,
                                                language: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Ano exato */}
                                <div className="col-12 col-md-4">
                                    <label htmlFor="filterYearExact" className="form-label">
                                        Ano exato
                                    </label>
                                    <input
                                        id="filterYearExact"
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        step="1"
                                        placeholder="Ex.: 2020"
                                        value={draftFilters.yearExact}
                                        onChange={(event) =>
                                            setDraftFilters((previous) => ({
                                                ...previous,
                                                yearExact: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Intervalo de publicação */}
                                <div className="col-12 col-md-4">
                                    <label htmlFor="filterYearFrom" className="form-label">
                                        Publicação a partir de
                                    </label>
                                    <input
                                        id="filterYearFrom"
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        step="1"
                                        placeholder="Ano inicial"
                                        value={draftFilters.yearFrom}
                                        onChange={(event) =>
                                            setDraftFilters((previous) => ({
                                                ...previous,
                                                yearFrom: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label htmlFor="filterYearTo" className="form-label">
                                        Publicação até
                                    </label>
                                    <input
                                        id="filterYearTo"
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        step="1"
                                        placeholder="Ano final"
                                        value={draftFilters.yearTo}
                                        onChange={(event) =>
                                            setDraftFilters((previous) => ({
                                                ...previous,
                                                yearTo: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Disponibilidade */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="filterAvailability" className="form-label">
                                        Disponibilidade em estoque
                                    </label>
                                    <select
                                        id="filterAvailability"
                                        className="form-select"
                                        value={draftFilters.availability}
                                        onChange={(event) =>
                                            setDraftFilters((previous) => ({
                                                ...previous,
                                                availability: event.target.value as
                                                    AdvancedBookFilters["availability"],
                                            }))
                                        }
                                    >
                                        <option value="all">Todas as disponibilidades</option>
                                        <option value="available">Disponível em estoque</option>
                                        <option value="unavailable">Sem estoque</option>
                                    </select>
                                </div>

                                {/* Estoque mínimo */}
                                <div className="col-12 col-md-3">
                                    <label htmlFor="filterMinStock" className="form-label">
                                        Estoque mínimo
                                    </label>
                                    <input
                                        id="filterMinStock"
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        step="1"
                                        value={draftFilters.minStock}
                                        onChange={(event) =>
                                            setDraftFilters((previous) => ({
                                                ...previous,
                                                minStock: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Estoque máximo */}
                                <div className="col-12 col-md-3">
                                    <label htmlFor="filterMaxStock" className="form-label">
                                        Estoque máximo
                                    </label>
                                    <input
                                        id="filterMaxStock"
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        step="1"
                                        value={draftFilters.maxStock}
                                        onChange={(event) =>
                                            setDraftFilters((previous) => ({
                                                ...previous,
                                                maxStock: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* Data de cadastro */}
                                <div className="col-12 col-md-6">
                                    <label htmlFor="filterCreatedFrom" className="form-label">
                                        Cadastro a partir de
                                    </label>
                                    <input
                                        id="filterCreatedFrom"
                                        type="date"
                                        className="form-control"
                                        value={draftFilters.createdFrom}
                                        onChange={(event) =>
                                            setDraftFilters((previous) => ({
                                                ...previous,
                                                createdFrom: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label htmlFor="filterCreatedTo" className="form-label">
                                        Cadastro até
                                    </label>
                                    <input
                                        id="filterCreatedTo"
                                        type="date"
                                        className="form-control"
                                        value={draftFilters.createdTo}
                                        onChange={(event) =>
                                            setDraftFilters((previous) => ({
                                                ...previous,
                                                createdTo: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        const emptyFilters: AdvancedBookFilters = {
                                            authorIds: [],
                                            genreIds: [],
                                            publisherId: "",
                                            yearExact: "",
                                            yearFrom: "",
                                            yearTo: "",
                                            language: "",
                                            availability: "all",
                                            minStock: "",
                                            maxStock: "",
                                            createdFrom: "",
                                            createdTo: "",
                                        };

                                        setDraftFilters(emptyFilters);
                                        setAppliedFilters(emptyFilters);
                                        setCurrentPage(1);
                                        setPageInput("1");
                                    }}
                                >
                                    Limpar filtros
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setAppliedFilters({ ...draftFilters });
                                        setCurrentPage(1);
                                        setPageInput("1");
                                    }}
                                >
                                    Aplicar filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <hr className="my-3"/>            
            
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                
                <div>
                    <h2 className="h4 mb-1">
                        {searchText.trim()
                        ? "Resultados da pesquisa"
                        :   viewMode === "all"
                            ? "Todos os livros"
                            : "Últimos livros cadastrados"}
                    </h2>
                    
                    {(searchText.trim() || viewMode === "all" || viewMode === "recent") && (
                        <p className="text-muted small mb-0">
                            {viewMode === "recent" && !searchText.trim()
                            ? "10 últimos livros cadastrados"
                            : `${totalCount} ${totalCount === 1 
                            ? "livro encontrado" 
                            : "livros encontrados"}`}
                        </p>
                    )}
                </div>
                <div className="d-flex align-items-center gap-2 mb-0">
                    <label htmlFor="sortMode" className="form-label small mb-0 text-nowrap">
                        Ordenar por
                    </label>

                    <select
                        id="sortMode"
                        className="form-select form-select-sm"
                        value={sortMode}
                        onChange={(event) => {
                            setSortMode(event.target.value);
                            setCurrentPage(1);
                            setPageInput("1");
                        }}
                    >
                        <option value="newest">Cadastro: mais recente</option>
                        <option value="oldest">Cadastro: mais antigo</option>
                        <option value="title_asc">Título: A-Z</option>
                        <option value="title_desc">Título: Z-A</option>
                        <option value="year_desc">Publicação: mais recente</option>
                        <option value="year_asc">Publicação: mais antiga</option>
                        <option value="stock_desc">Estoque: maior quantidade</option>
                        <option value="stock_asc">Estoque: menor quantidade</option>
                    </select>
                </div>
            </div>
            
            {loading && <p>Carregando livros...</p>}

            {errorMessage && (
                <div className="alert alert-danger">
                    {errorMessage}
                </div>
            )}

            {!loading && !errorMessage && books.length === 0 && (
                <p>
                    {searchText.trim()
                        ? "Nenhum livro encontrado."
                        : "Nenhum livro cadastrado."
                    }
                </p>
            )}

            <div className="d-flex flex-column gap-3">
                {books.map((book) => (
                    <div 
                        key={book.id} 
                        className="card shadow-sm"
                    >
                        <div className="card-body">
                            <h3 className="h5 card-title mb-3">
                                {book.title}
                            </h3>

                            <p className="mb-2">
                                <strong>Autor(es):</strong>{" "}    
                                {book.BookAuthors
                                    .map((item) => item.Authors?.full_name)
                                    .filter(Boolean)
                                    .join(", ") || "Não informado"}
                            </p>

                            <p className="mb-2">
                                <strong>ISBN:</strong>{" "} 
                                {book.isbn}
                            </p>

                            <p className="mb-2">
                                <strong>Ano:</strong>{" "}
                                {(book.publication_year ?? "Não informado")}
                            </p>

                            <p className="mb-0">
                                <strong>Quantidade total:</strong>{" "}
                                {book.stock_quantity}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {!loading &&
                !errorMessage &&
                (searchText.trim() !== "" || viewMode === "all") &&
                totalPages > 0 && (
                <div className="mt-4">
                    <div className="d-flex justify-content-center align-items-center gap-4">
                        <button
                            type="button"
                            className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
                            style={{ width: "40px", height: "40px" }}
                            disabled={currentPage === 1}
                            onClick={() => goToPage(currentPage - 1)}
                            aria-label="Página anterior"
                        >
                            <span aria-hidden="true" style={{ fontSize: "24px", lineHeight: 1, transform: "translateY(-2px)" }}>
                                ←
                            </span>
                        </button>

                        <div className="d-flex align-items-center gap-2">
                            <label htmlFor="pageInput" className="mb-0 text-nowrap">
                                Página
                            </label>

                            <input
                                id="pageInput"
                                type="number"
                                min="1"
                                max={totalPages}
                                step="1"
                                className={`form-control text-center ${
                                    isPageInputInvalid ? "border border-danger" : ""
                                }`}
                                style={{ width: "70px" }}
                                value={pageInput}
                                onChange={(event) =>
                                    handlePageInputChange(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && !isPageInputInvalid) {
                                        goToPage(pageInputNumber);
                                    }
                                }}
                            />

                            <span className="text-nowrap">de {totalPages}</span>
                        </div>

                        <button
                            type="button"
                            className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
                            style={{ width: "40px", height: "40px" }}
                            disabled={currentPage === totalPages}
                            onClick={() => goToPage(currentPage + 1)}
                            aria-label="Próxima página"
                        >
                            <span aria-hidden="true" style={{ fontSize: "24px", lineHeight: 1, transform: "translateY(-2px)" }}>
                                →
                            </span>
                        </button>
                    </div>

                    <p className="text-center text-muted small mt-2 mb-0">
                        Mostrando {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} de {totalCount} livros
                    </p>
                </div>
            )}
        </main>
    );
}

export default SearchPage;