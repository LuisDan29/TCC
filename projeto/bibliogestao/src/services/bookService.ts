import { supabase } from "../lib/supabase-client";
import type { BookFormdata } from "../types/BookFormData";

export async function createBook(bookData: BookFormdata) {
  const conditions = Object.fromEntries(
    bookData.book_conditions.map((quantity, index) => [
      `condition_${index}`,
      quantity,
    ]),
  );

  const { data, error } = await supabase.rpc("create_book", {
    p_isbn: bookData.isbn,
    p_title: bookData.title,
    p_subtitle: bookData.subtitle,
    p_edition: bookData.edition,
    p_language: bookData.language,
    p_publication_year: bookData.publication_year,
    p_stock_quantity: bookData.number_books_inserted,
    p_conditions: conditions,
    p_publisher_name: bookData.publisher_name,
    p_publisher_country: bookData.publisher_country,
    p_authors: bookData.authors,
    p_genres: bookData.genres,
  });

  if (error) throw error;

  return data;
}

export async function getRecentBooks() {
  const { data, error } = await supabase
    .from("Books")
    .select(
      `
      id, 
      title, 
      isbn, 
      publication_year, 
      stock_quantity,
      created_at,
      BookAuthors (
        Authors (
          full_name
        )
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  return data;
}

export async function searchBooks(searchText: string) {
  const search = searchText.trim();

  const { data, error } = await supabase
    .from("Books")
    .select(
      `
      id,
      title,
      isbn, 
      publication_year,
      created_at,
      BookAuthors (
        Author (
          full_name
        )
      )
    `,
    )
    .or(`title.ilike.%${search}%,isbn.ilike.%${search}%`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}
