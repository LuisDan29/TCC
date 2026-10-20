import { useEffect, useState } from "react";
import { getRecentBooks, getAllBooks, searchBooks } from "../../services/bookService";

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

    const pageSize = 20;
    const totalPages = Math.ceil(totalCount / pageSize);
    const pageInputNumber = Number(pageInput);
    const isPageInputInvalid =
        pageInput.trim() === "" ||
        !Number.isInteger(pageInputNumber) ||
        pageInputNumber < 1 ||
        pageInputNumber > totalPages;

    function goToPage(page: number) {
        if (page < 1 || page > totalPages) return
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