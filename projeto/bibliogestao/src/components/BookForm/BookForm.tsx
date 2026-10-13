import { useState } from "react";

import BookFields from "./BookFields/BookFields";
import AuthorFields from "./AuthorFields/AuthorFields";
import PublisherFields from "./PublisherFields/PublisherFields";
import CollectionFields from "./CollectionFields/CollectionFields";

import { createBook } from "../../services/bookService";

import { validateISBN } from "../../utils/bookValidation";

function BookForm() {
  // Book
  const [isbn, setISBN] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [edition, setEdition] = useState(1);
  const [language, setLanguage] = useState("");
  const [publicationYear, setPublicationYear] = useState(2026);

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
  const [bookConditions, setBookConditions] = useState<number[]>([
    0, // Irrecuperável
    0, // Precário
    0, // Desgastado
    0, // Regular
    0, // Bem conservado
    0, // Novo
  ]);

  async function sendForm(event: React.SubmitEvent) {
    event.preventDefault();

    const totalDistributed = bookConditions.reduce(
      (total, quantity) => total + quantity,
      0,
    );

    if (totalDistributed !== numberBooksInserted) {
      return;
    }

    if (!validateISBN(isbn)) {
      return;
    }

    const bookData = {
      // Book
      isbn: isbn.replace(/[\s-]/g, "").toUpperCase(),
      title: title,
      subtitle: subtitle,
      edition: edition,
      language: language,
      publication_year: publicationYear,

      // Genres
      genres: genres,

      // Authors
      authors: authors,

      // Publisher
      publisher_name: publisherName,
      publisher_country: publisherCountry,

      // Collection
      number_books_inserted: numberBooksInserted,
      book_conditions: bookConditions,
    };

    await createBook(bookData);
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

          <button type="submit" className="btn btn-primary">
            Enviar
          </button>
        </form>
        <br></br>
      </section>
    </>
  );
}

export default BookForm;
