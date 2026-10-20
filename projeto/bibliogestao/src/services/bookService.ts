import { supabase } from "../lib/supabase-client";
import type { BookFormdata } from "../types/BookFormData";

export interface AdvancedBookFilters {
    authorIds: number[];
    genreIds: number[];
    publisherId: string;
    yearExact: string;
    yearFrom: string;
    yearTo: string;
    language: string;
    availability: "all" | "available" | "unavailable";
    minStock: string;
    maxStock: string;
    createdFrom: string;
    createdTo: string;
}

export interface BookFilterOptions {
    authors: { id: number; full_name: string }[];
    genres: { id: number; name: string }[];
    publishers: { id: number; name: string }[];
}

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

function getSortOptions(sortMode: string) {
  let column = "created_at";
  let ascending = false;
      
  switch (sortMode) {
    case "oldest":
      ascending = true;
      break;

    case "title_asc":
      column = "title";
      ascending = true;
      break;

    case "title_desc":
      column = "title";
      ascending = false;
      break;

    case "year_asc":
      column = "publication_year";
      ascending = true;
      break;

    case "year_desc":
      column = "publication_year";
      ascending = false;
      break;

    case "stock_asc":
      column = "stock_quantity";
      ascending = true;
      break;

    case "stock_desc":
      column = "stock_quantity";
      ascending = false;
      break;
  }

  return { column, ascending }
}

export async function getRecentBooks(sortMode: string = "newest") {
  const { column, ascending } = getSortOptions(sortMode);

  const { data, error } = await supabase
    .from("Books")
    .select(`
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
    `)
    .order(column, { ascending })
    .limit(10);

  if (error) throw error;

  return data;
}

export async function getAllBooks(
  sortMode: string = "newest",
  page: number = 1,
  pageSize: number = 20
) {
  
  const { column, ascending } = getSortOptions(sortMode);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("Books")
    .select(`
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
    `, {count: "exact"})

    .order(column, { ascending })
    .range(from, to);

  if (error) throw error;

  return {
    books: data ?? [],
    totalCount: count ?? 0,
  };
} 

export async function searchBooks(
  searchText: string,
  sortMode: string = "newest",
  page: number = 1,
  pageSize: number = 20
) {

  const search = searchText.trim();
  const { column, ascending } = getSortOptions(sortMode);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("Books")
    .select(`
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
    `, {count: "exact"})
    .or(`title.ilike.%${search}%,isbn.ilike.%${search}%`)
    .order(column, { ascending })
    .range(from,to);

  if (error) throw error;

  return {
    books: data ?? [],
    totalCount: count ?? 0,
  };
}

export async function getBookFilterOptions(): Promise<BookFilterOptions> {
    const [
        { data: authors, error: authorsError },
        { data: genres, error: genresError },
        { data: publishers, error: publishersError },
    ] = await Promise.all([
        supabase
            .from("Authors")
            .select("id, full_name")
            .order("full_name", { ascending: true }),

        supabase
            .from("Genres")
            .select("id, name")
            .order("name", { ascending: true }),

        supabase
            .from("Publishers")
            .select("id, name")
            .order("name", { ascending: true }),
    ]);

    if (authorsError) throw authorsError;
    if (genresError) throw genresError;
    if (publishersError) throw publishersError;

    return {
        authors: authors ?? [],
        genres: genres ?? [],
        publishers: publishers ?? [],
    };
}
