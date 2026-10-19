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

    useEffect(() => {
        let cancelled = false;
        
        async function loadBooks() {
            setLoading(true);
            setErrorMessage("");

            try {
                const data = searchText.trim()
                ? await searchBooks(searchText, sortMode)
                : viewMode === "all"
                    ? await getAllBooks(sortMode)
                    : await getRecentBooks(sortMode);

                if (!cancelled) {
                    setBooks(data);
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
    }, [searchText, viewMode, sortMode]);

    return (
        <main className="container py-4">
            <h1>Pesquisar livros</h1>

            <div className="mb-4">
                <input
                    type="search"
                    className="form-control"
                    placeholder="Pesquisar por título ou ISBN..."
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
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

                    {(searchText.trim() || viewMode === "all") && (
                        <p className="text-muted small mb-0">
                            {books.length} {books.length === 1 
                            ? "livro encontrado" 
                            : "livros encontrados"}
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
                        onChange={(event) => setSortMode(event.target.value)}
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
        </main>
    );
}

export default SearchPage;