import { useState } from "react";

import BookFields from "./BookFields/BookFields";
import AuthorFields from "./AuthorFields/AuthorFields";
import PublisherFields from "./PublisherFields/PublisherFields";
import CollectionFields from "./CollectionFields/CollectionFields";

import { createBook } from "../../services/bookService";
import { getBookByISBN } from "../../services/isbnApiService";

import {
  validateISBN,
  validateStockQuantity,
} from "../../utils/bookValidation";
import { cleanList } from "../../utils/textUtils";
import { getErrorMessage } from "../../utils/errorMessages";

const CURRENT_YEAR = new Date().getFullYear();
const EMPTY_CONDITIONS = [
  0, // Irrecuperável
  0, // Precário
  0, // Desgastado
  0, // Regular
  0, // Bem conservado
  0, // Novo
];

function BookForm() {
  // Book
  const [isbn, setISBN] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [edition, setEdition] = useState(1);
  const [language, setLanguage] = useState("");
  const [publicationYear, setPublicationYear] = useState(CURRENT_YEAR);

  // Genres
  const [genres, setGenres] = useState<string[]>([]);
  const [inputGenres, setInputGenres] = useState("");

  // Authors
  const [authors, setAuthors] = useState<string[]>([""]);

  // Publisher
  const [publisherName, setPublisherName] = useState("");
  const [publisherCountry, setPublisherCountry] = useState("");

  // Collection
  const [numberBooksInserted, setNumberBooksInserted] = useState(1);
  const [bookConditions, setBookConditions] =
    useState<number[]>(EMPTY_CONDITIONS);

  // API
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function fillBookFields(isbn: string) {
    if (!validateISBN(isbn)) return;

    setIsSearching(true);
    setSearchMessage("");

    try {
      const bookInfo = await getBookByISBN(isbn);

      setTitle(bookInfo.title ?? "");
      setSubtitle(bookInfo.subtitle ?? "");
      setAuthors(bookInfo.authors.length ? bookInfo.authors : [""]);
      setPublicationYear(bookInfo.year ?? 2026);
      setGenres(bookInfo.subjects.length ? bookInfo.subjects : []);
      setPublisherName(bookInfo.publisher ?? "");

      setSearchMessage("✅ Livro encontrado com sucesso!");
    } catch (error) {
      setSearchMessage("❌ Não foi possível encontrar o livro.");
    } finally {
      setIsSearching(false);
    }
  }

  function showError(message: string) {
    setSubmitStatus({ type: "error", message });
  }

  function resetForm() {
    setISBN("");
    setTitle("");
    setSubtitle("");
    setEdition(1);
    setLanguage("");
    setPublicationYear(CURRENT_YEAR);
    setGenres([]);
    setInputGenres("");
    setAuthors([""]);
    setPublisherName("");
    setPublisherCountry("");
    setNumberBooksInserted(1);
    setBookConditions(EMPTY_CONDITIONS);
    setSearchMessage("");
  }

  async function sendForm(event: React.SubmitEvent) {
    event.preventDefault();

    if (isSubmitting) return;

    const cleanTitle = title.trim();
    const cleanPublisherName = publisherName.trim();
    const cleanAuthors = cleanList(authors);

    if (!validateISBN(isbn)) {
      showError("Informe um ISBN válido.");
      return;
    }

    if (!cleanTitle) {
      showError("Informe o título do livro.");
      return;
    }

    if (cleanAuthors.length === 0) {
      showError("Informe pelo menos um autor.");
      return;
    }

    if (!cleanPublisherName) {
      showError("Informe o nome da editora.");
      return;
    }

    if (!validateStockQuantity(bookConditions, numberBooksInserted)) {
      showError(
        "A soma das quantidades por condição deve ser igual à quantidade total.",
      );
      return;
    }

    const bookData = {
      // Book
      isbn: isbn.replace(/[\s-]/g, "").toUpperCase(),
      title: cleanTitle,
      subtitle: subtitle.trim(),
      edition: edition,
      language: language.trim(),
      publication_year: publicationYear,

      // Genres
      genres: cleanList(genres),

      // Authors
      authors: cleanAuthors,

      // Publisher
      publisher_name: cleanPublisherName,
      publisher_country: publisherCountry.trim(),

      // Collection
      number_books_inserted: numberBooksInserted,
      book_conditions: bookConditions,
    };

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await createBook(bookData);
      setSubmitStatus({
        type: "success",
        message: "Livro cadastrado com sucesso!",
      });
      resetForm();
    } catch (error) {
      console.error("Erro ao cadastrar livro:", error);
      setSubmitStatus({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section id="BookForm" className="container">
        <h1>Cadastro de Livros</h1>
        <br></br>
        <form onSubmit={sendForm}>
          {/* BOOKS FIELD */}
          <BookFields
            isbn={isbn}
            setISBN={setISBN}
            fillBookFields={fillBookFields}
            isSearching={isSearching}
            searchMessage={searchMessage}
            title={title}
            setTitle={setTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            edition={edition}
            setEdition={setEdition}
            language={language}
            setLanguage={setLanguage}
            publicationYear={publicationYear}
            setPublicationYear={setPublicationYear}
            genres={genres}
            setGenres={setGenres}
            inputGenres={inputGenres}
            setInputGenres={setInputGenres}
          />

          {/* AUTHOR FIELD */}
          <AuthorFields authors={authors} setAuthors={setAuthors} />

          {/* PUBLISHERS FIELD */}
          <PublisherFields
            publisherName={publisherName}
            setPublisherName={setPublisherName}
            publisherCountry={publisherCountry}
            setPublisherCountry={setPublisherCountry}
          />

          {/* COLLECTION FIELD */}
          <CollectionFields
            numberBooksInserted={numberBooksInserted}
            setNumberBooksInserted={setNumberBooksInserted}
            bookConditions={bookConditions}
            setBookConditions={setBookConditions}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Livro"}
          </button>

          {submitStatus && (
            <div
              role="alert"
              className={`alert mt-3 ${
                submitStatus.type === "success"
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              {submitStatus.message}
            </div>
          )}
        </form>
        <br></br>
      </section>
    </>
  );
}

export default BookForm;
