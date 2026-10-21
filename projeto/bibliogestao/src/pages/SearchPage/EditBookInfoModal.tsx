import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import {
    getBookDetails,
    updateBookInfo,
    type BookDetails,
} from "../../services/bookService";
import { cleanList } from "../../utils/textUtils";
import { getErrorMessage } from "../../utils/errorMessages";

interface EditBookInfoModalProps {
    bookId: number;
    onClose: () => void;
    onSaved: (message: string) => void;
}

const MAX_YEAR = new Date().getFullYear() + 1;

function EditBookInfoModal({ bookId, onClose, onSaved }: EditBookInfoModalProps) {
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [isbn, setIsbn] = useState("");
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [edition, setEdition] = useState("1");
    const [language, setLanguage] = useState("");
    const [publicationYear, setPublicationYear] = useState("");
    const [publisherName, setPublisherName] = useState("");
    const [publisherCountry, setPublisherCountry] = useState("");
    const [authors, setAuthors] = useState<string[]>([""]);
    const [genresText, setGenresText] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const book: BookDetails = await getBookDetails(bookId);
                if (cancelled) return;

                setIsbn(book.isbn);
                setTitle(book.title ?? "");
                setSubtitle(book.subtitle ?? "");
                setEdition(String(book.edition ?? 1));
                setLanguage(book.language ?? "");
                setPublicationYear(
                    book.publication_year !== null ? String(book.publication_year) : "",
                );
                setPublisherName(book.Publishers?.name ?? "");
                setPublisherCountry(book.Publishers?.country ?? "");

                const loadedAuthors = book.BookAuthors
                    .map((item) => item.Authors?.full_name)
                    .filter((name): name is string => Boolean(name));
                setAuthors(loadedAuthors.length > 0 ? loadedAuthors : [""]);

                setGenresText(
                    book.BookGenres
                        .map((item) => item.Genres?.name)
                        .filter(Boolean)
                        .join(", "),
                );
            } catch (error) {
                console.error("Erro ao carregar o livro para edição:", error);
                if (!cancelled) setLoadError("Não foi possível carregar o livro.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [bookId]);

    function updateAuthor(index: number, value: string) {
        setAuthors((previous) =>
            previous.map((author, i) => (i === index ? value : author)),
        );
    }

    async function handleSubmit(event: React.SyntheticEvent) {
        event.preventDefault();

        if (isSaving) return;

        const cleanTitle = title.trim();
        const cleanAuthors = cleanList(authors);
        const cleanPublisher = publisherName.trim();
        const editionNumber = Number(edition);
        const yearNumber = Number(publicationYear);

        if (!cleanTitle) return setFormError("Informe o título do livro.");
        if (cleanAuthors.length === 0) return setFormError("Informe pelo menos um autor.");
        if (!cleanPublisher) return setFormError("Informe o nome da editora.");

        if (!Number.isInteger(editionNumber) || editionNumber < 1) {
            return setFormError("A edição deve ser um número inteiro maior que zero.");
        }

        if (
            publicationYear.trim() === "" ||
            !Number.isInteger(yearNumber) ||
            yearNumber < 1 ||
            yearNumber > MAX_YEAR
        ) {
            return setFormError(`Informe um ano de publicação válido (até ${MAX_YEAR}).`);
        }

        setIsSaving(true);
        setFormError("");

        try {
            await updateBookInfo(bookId, {
                title: cleanTitle,
                subtitle: subtitle.trim(),
                edition: editionNumber,
                language: language.trim(),
                publication_year: yearNumber,
                publisher_name: cleanPublisher,
                publisher_country: publisherCountry.trim(),
                authors: cleanAuthors,
                genres: cleanList(genresText.split(",")),
            });

            onSaved("Informações do livro atualizadas com sucesso!");
        } catch (error) {
            console.error("Erro ao editar livro:", error);
            setFormError(getErrorMessage(error));
            setIsSaving(false);
        }
    }

    return (
        <ModalShell
            title="Editar informações"
            onClose={onClose}
            busy={isSaving}
            size="lg"
            footer={
                <>
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={isSaving}
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="editBookInfoForm"
                        className="btn btn-primary"
                        disabled={isSaving || loading || !!loadError}
                    >
                        {isSaving ? "Salvando..." : "Salvar alterações"}
                    </button>
                </>
            }
        >
            {loading && <p className="mb-0">Carregando livro...</p>}

            {loadError && <div className="alert alert-danger mb-0">{loadError}</div>}

            {!loading && !loadError && (
                <form id="editBookInfoForm" onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="editIsbn" className="form-label">
                            ISBN
                        </label>
                        <input
                            id="editIsbn"
                            className="form-control"
                            value={isbn}
                            disabled
                            readOnly
                        />
                        <div className="form-text">O ISBN não pode ser alterado.</div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="editTitle" className="form-label">
                            Título
                        </label>
                        <input
                            id="editTitle"
                            className="form-control"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="editSubtitle" className="form-label">
                            Subtítulo
                        </label>
                        <input
                            id="editSubtitle"
                            className="form-control"
                            value={subtitle}
                            onChange={(event) => setSubtitle(event.target.value)}
                        />
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-12 col-md-4">
                            <label htmlFor="editEdition" className="form-label">
                                Edição
                            </label>
                            <input
                                id="editEdition"
                                type="number"
                                min="1"
                                step="1"
                                className="form-control"
                                value={edition}
                                onChange={(event) => setEdition(event.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-4">
                            <label htmlFor="editYear" className="form-label">
                                Ano de publicação
                            </label>
                            <input
                                id="editYear"
                                type="number"
                                min="1"
                                step="1"
                                className="form-control"
                                value={publicationYear}
                                onChange={(event) => setPublicationYear(event.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-4">
                            <label htmlFor="editLanguage" className="form-label">
                                Idioma
                            </label>
                            <input
                                id="editLanguage"
                                className="form-control"
                                value={language}
                                onChange={(event) => setLanguage(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
                            <label htmlFor="editPublisher" className="form-label">
                                Editora
                            </label>
                            <input
                                id="editPublisher"
                                className="form-control"
                                value={publisherName}
                                onChange={(event) => setPublisherName(event.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label htmlFor="editPublisherCountry" className="form-label">
                                País da editora
                            </label>
                            <input
                                id="editPublisherCountry"
                                className="form-control"
                                value={publisherCountry}
                                onChange={(event) => setPublisherCountry(event.target.value)}
                            />
                        </div>
                    </div>

                    <fieldset className="mb-3">
                        <legend className="form-label fs-6">Autores</legend>

                        {authors.map((author, index) => (
                            <div key={index} className="d-flex gap-2 mb-2">
                                <input
                                    className="form-control"
                                    placeholder="Nome do autor"
                                    aria-label={`Autor ${index + 1}`}
                                    value={author}
                                    onChange={(event) => updateAuthor(index, event.target.value)}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    disabled={authors.length === 1}
                                    aria-label={`Remover autor ${index + 1}`}
                                    onClick={() =>
                                        setAuthors((previous) =>
                                            previous.filter((_, i) => i !== index),
                                        )
                                    }
                                >
                                    Remover
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setAuthors((previous) => [...previous, ""])}
                        >
                            + Adicionar autor
                        </button>
                    </fieldset>

                    <div className="mb-1">
                        <label htmlFor="editGenres" className="form-label">
                            Gêneros
                        </label>
                        <input
                            id="editGenres"
                            className="form-control"
                            placeholder="Separe os gêneros por vírgula"
                            value={genresText}
                            onChange={(event) => setGenresText(event.target.value)}
                        />
                    </div>

                    {formError && (
                        <div role="alert" className="alert alert-danger mt-3 mb-0">
                            {formError}
                        </div>
                    )}
                </form>
            )}
        </ModalShell>
    );
}

export default EditBookInfoModal;
