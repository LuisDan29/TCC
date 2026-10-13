import { useEffect, useState } from "react";
import { getRecentBooks, searchBooks } from "../../services/bookService";

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
    
    const filteredBooks = books.filter((book) => {
        const search = searchText.toLowerCase().trim();

        return (
            book.title.toLowerCase().includes(search) ||
            book.isbn.toLowerCase().includes(search)
        );
    });

    useEffect(() => {
        async function loadBooks() {
            try {
                const data = await getRecentBooks();
                setBooks(data);                
            } catch (error) {
                console.error("Erro ao carregar livros:", error);
                setErrorMessage("Não foi possível carregar os livros.");
            } finally {
                setLoading(false);
            }
        }
        
        loadBooks();        
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
                    onChange={(event) => setSearchText(event.target.value)}
                />
            </div>

            <h2 className="h4">
                {searchText.trim()
                ? "Resultados da pesquisa"
                : "Últimos livros cadastrados"}
            </h2>
            
            {loading && <p>Carregando livros...</p>}

            {errorMessage && (
                <div className="alert alert-danger">
                    {errorMessage}
                </div>
            )}

            {!loading && !errorMessage && filteredBooks.length === 0 && (
                <p>
                    {searchText.trim()
                        ? "Nenhum livro encontrado."
                        : "Nenhum livro cadastrado."
                    }
                </p>
            )}

            <div className="list-group">
                {filteredBooks.map((book) => (
                    <div key={book.id} className="list-group-item">
                        <h3 className="h5">{book.title}</h3>

                        <p className="mb-1">
                            Author:{" "}
                            {book.BookAuthors
                            .map((item) => item.Authors?.full_name)
                            .filter(Boolean)
                            .join(", ") || "Não informado"}
                        </p>

                        <p className="mb-1">
                            ISBN: {book.isbn}
                        </p>

                        <p className="mb-1">
                            Ano: {book.publication_year ?? "Não informado"}
                        </p>

                        <p className="mb-1">
                            Exemplares: {book.stock_quantity}
                        </p>
                    </div>
                ))}
            </div>
        </main>
    );
}

export default SearchPage;