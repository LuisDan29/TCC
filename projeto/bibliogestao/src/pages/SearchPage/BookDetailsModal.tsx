import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { getBookDetails, type BookDetails } from "../../services/bookService";
import { BOOK_CONDITIONS, conditionsToArray } from "../../constants/bookConditions";

interface BookDetailsModalProps {
    bookId: number;
    onClose: () => void;
}

function formatDate(value: string) {
    return new Date(value).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function BookDetailsModal({ bookId, onClose }: BookDetailsModalProps) {
    const [book, setBook] = useState<BookDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const details = await getBookDetails(bookId);
                if (!cancelled) setBook(details);
            } catch (error) {
                console.error("Erro ao carregar detalhes do livro:", error);
                if (!cancelled) {
                    setErrorMessage("Não foi possível carregar os detalhes do livro.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [bookId]);

    const authors = book?.BookAuthors
        .map((item) => item.Authors?.full_name)
        .filter(Boolean)
        .join(", ");

    const genres = book?.BookGenres
        .map((item) => item.Genres?.name)
        .filter(Boolean)
        .join(", ");

    const conditionQuantities = conditionsToArray(book?.conditions);

    return (
        <ModalShell
            title="Detalhes do livro"
            onClose={onClose}
            size="lg"
            footer={
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Fechar
                </button>
            }
        >
            {loading && <p className="mb-0">Carregando detalhes...</p>}

            {errorMessage && <div className="alert alert-danger mb-0">{errorMessage}</div>}

            {book && (
                <>
                    <h3 className="h4 mb-1">{book.title}</h3>
                    {book.subtitle && <p className="text-muted">{book.subtitle}</p>}

                    <dl className="row mt-3 mb-4">
                        <dt className="col-sm-4">Autor(es)</dt>
                        <dd className="col-sm-8">{authors || "Não informado"}</dd>

                        <dt className="col-sm-4">ISBN</dt>
                        <dd className="col-sm-8">{book.isbn}</dd>

                        <dt className="col-sm-4">Edição</dt>
                        <dd className="col-sm-8">{book.edition ?? "Não informado"}</dd>

                        <dt className="col-sm-4">Idioma</dt>
                        <dd className="col-sm-8">{book.language || "Não informado"}</dd>

                        <dt className="col-sm-4">Ano de publicação</dt>
                        <dd className="col-sm-8">{book.publication_year ?? "Não informado"}</dd>

                        <dt className="col-sm-4">Editora</dt>
                        <dd className="col-sm-8">{book.Publishers?.name || "Não informada"}</dd>

                        <dt className="col-sm-4">País da editora</dt>
                        <dd className="col-sm-8">{book.Publishers?.country || "Não informado"}</dd>

                        <dt className="col-sm-4">Gêneros</dt>
                        <dd className="col-sm-8">{genres || "Não informado"}</dd>

                        <dt className="col-sm-4">Cadastrado em</dt>
                        <dd className="col-sm-8">{formatDate(book.created_at)}</dd>

                        <dt className="col-sm-4">Quantidade total</dt>
                        <dd className="col-sm-8">{book.stock_quantity}</dd>
                    </dl>

                    <h4 className="h6 fw-semibold">Quantidade por condição</h4>
                    <ul className="list-group">
                        {BOOK_CONDITIONS.map((condition) => (
                            <li
                                key={condition.number}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <span>{condition.name}</span>
                                <span className="badge bg-primary rounded-pill">
                                    {conditionQuantities[condition.number]}
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </ModalShell>
    );
}

export default BookDetailsModal;
