import { supabase } from "../lib/supabase-client";

import type { BookFormdata } from "../types/BookFormData";

import { getOrCreatePublisher } from "./publisherService";
import { getOrCreateAuthors } from "./authorService";
import { getOrCreateGenres } from "./genreService";

export async function createBook(bookData: BookFormdata) {
  const conditionsObject = Object.fromEntries(
    bookData.book_conditions.map((quantity, index) => [
      `condition_${index}`,
      quantity,
    ]),
  );

  const publisherId = await getOrCreatePublisher(
    bookData.publisher_name,
    bookData.publisher_country,
  );

  const newBook = {
    // Foreign Keys
    publisher_id: publisherId,
    // Columns
    isbn: bookData.isbn,
    title: bookData.title,
    subtitle: bookData.subtitle,
    edition: bookData.edition,
    language: bookData.language,
    publication_year: bookData.publication_year,
    stock_quantity: bookData.number_books_inserted,
    conditions: conditionsObject,
  };

  const { data, error } = await supabase
    .from("Books")
    .insert(newBook)
    .select("id")
    .single();

  if (error) throw error;

  const bookId = data.id;
  const authorIds = await getOrCreateAuthors(bookData.authors);
  const genreIds = await getOrCreateGenres(bookData.genres);

  const bookAuthors = authorIds.map((authorId) => ({
    book_id: bookId,
    author_id: authorId,
  }));

  const bookGenres = genreIds.map((genreId) => ({
    book_id: bookId,
    genre_id: genreId,
  }));

  const { error: bookAuthorsError } = await supabase
    .from("BookAuthors")
    .insert(bookAuthors);

  if (bookAuthorsError) throw bookAuthorsError;

  const { error: bookGenresError } = await supabase
    .from("BookGenres")
    .insert(bookGenres);

  if (bookGenresError) bookGenresError;

  return newBook;
}
