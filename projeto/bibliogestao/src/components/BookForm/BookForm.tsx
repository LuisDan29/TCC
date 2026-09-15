import { useState } from "react";
import { supabase } from "../../lib/supabase-client";

import BookFields from "./BookFields";
import AuthorFields from "./AuthorFields";
import PublisherFields from "./PublisherFields";
import CollectionFields from "./CollectionFields";

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

    // Author
    const [authorFullName, setAuthorFullName] = useState<string[]>([""]);
    
    // Publisher
    const [publisherName, setPublisherName] = useState("");
    const [publisherCNPJ, setPublisherCNPJ] = useState("");
    const [publisherCountry, setPublisherCountry] = useState("");

    // Collection
    const [condition, setCondition] = useState(0);
    const [numberBooksInserted, setNumberBooksInserted] = useState(1);

    async function sendForm(event: React.SubmitEvent) {
      event.preventDefault();
      
      const newBook = {
        isbn: isbn,
        title: title,
        subtitle: subtitle,
        edition: edition,
        language: language,
        publication_year: publicationYear,
        //numberBooksInserted,
        condition: condition
      }

      const { data, error } = await supabase
        .from("Books")
        .insert(newBook)

      if (error) {
        console.error("Erro ao cadastrar:", error);
        return;
      }

      return data;
    }

    return (
    <>
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
        <AuthorFields 
          authorFullName={authorFullName}
          setAuthorFullName={setAuthorFullName}
        />

        {/* PUBLISHERS FIELD */}
        <PublisherFields 
          publisherName={publisherName}
          setPublisherName={setPublisherName}
          publisherCNPJ={publisherCNPJ}
          setPublisherCNPJ={setPublisherCNPJ}
          publisherCountry={publisherCountry}
          setPublisherCountry={setPublisherCountry}
        />

        {/* COLLECTION FIELD */}
        <CollectionFields
          condition={condition}
          setCondition={setCondition}
          numberBooksInserted={numberBooksInserted}
          setNumberBooksInserted={setNumberBooksInserted}
        />

        <button type="submit" className="btn btn-primary">Enviar</button>
        
      </form>
      <br></br>
    </>
    )
}    

export default BookForm;
