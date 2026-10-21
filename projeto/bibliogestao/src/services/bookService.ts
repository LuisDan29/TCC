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

export interface BookListItem {
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

export interface BookDetails {
    id: number;
    isbn: string;
    title: string;
    subtitle: string | null;
    edition: number | null;
    language: string | null;
    publication_year: number | null;
    stock_quantity: number;
    conditions: Record<string, number> | null;
    created_at: string;
    Publishers: { name: string; country: string | null } | null;
    BookAuthors: { Authors: { full_name: string } | null }[];
    BookGenres: { Genres: { name: string } | null }[];
}

// Dados editáveis de um livro (o ISBN não faz parte: ele é imutável)
export interface BookInfoUpdate {
    title: string;
    subtitle: string;
    edition: number;
    language: string;
    publication_year: number;
    publisher_name: string;
    publisher_country: string;
    authors: string[];
    genres: string[];
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

  return (data ?? []) as unknown as BookListItem[];
}

const BOOK_LIST_COLUMNS = `
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
    `;

// Escapa % e _ para que o texto digitado seja tratado literalmente no ilike
function escapeLike(text: string) {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function startOfLocalDay(date: string) {
  return new Date(`${date}T00:00:00`);
}

// Monta a consulta de livros já com os filtros avançados aplicados.
// Tudo é filtrado no Supabase, então a paginação e a contagem continuam
// vindo do servidor.
function buildBooksQuery(filters?: AdvancedBookFilters) {
  const hasAuthors = !!filters && filters.authorIds.length > 0;
  const hasGenres = !!filters && filters.genreIds.length > 0;

  // Para filtrar por autor/gênero usamos "embeds" extras com alias e !inner.
  // Assim o livro só aparece se tiver pelo menos um dos autores/gêneros
  // escolhidos (OU dentro da categoria, E entre categorias), e a lista de
  // autores mostrada no card continua completa (vem do embed BookAuthors).
  const select =
    BOOK_LIST_COLUMNS +
    (hasAuthors ? ", filter_authors:BookAuthors!inner ( author_id )" : "") +
    (hasGenres ? ", filter_genres:BookGenres!inner ( genre_id )" : "");

  let query = supabase.from("Books").select(select, { count: "exact" });

  if (!filters) return query;

  if (hasAuthors) {
    query = query.in("filter_authors.author_id", filters.authorIds);
  }

  if (hasGenres) {
    query = query.in("filter_genres.genre_id", filters.genreIds);
  }

  if (filters.publisherId) {
    query = query.eq("publisher_id", Number(filters.publisherId));
  }

  if (filters.yearExact.trim()) {
    query = query.eq("publication_year", Number(filters.yearExact));
  }

  if (filters.yearFrom.trim()) {
    query = query.gte("publication_year", Number(filters.yearFrom));
  }

  if (filters.yearTo.trim()) {
    query = query.lte("publication_year", Number(filters.yearTo));
  }

  if (filters.language.trim()) {
    query = query.ilike("language", `%${escapeLike(filters.language.trim())}%`);
  }

  if (filters.availability === "available") {
    query = query.gt("stock_quantity", 0);
  } else if (filters.availability === "unavailable") {
    query = query.lte("stock_quantity", 0);
  }

  if (filters.minStock.trim()) {
    query = query.gte("stock_quantity", Number(filters.minStock));
  }

  if (filters.maxStock.trim()) {
    query = query.lte("stock_quantity", Number(filters.maxStock));
  }

  if (filters.createdFrom) {
    query = query.gte(
      "created_at",
      startOfLocalDay(filters.createdFrom).toISOString(),
    );
  }

  if (filters.createdTo) {
    // Limite exclusivo: o início do dia seguinte inclui o dia final inteiro
    const nextDay = startOfLocalDay(filters.createdTo);
    nextDay.setDate(nextDay.getDate() + 1);
    query = query.lt("created_at", nextDay.toISOString());
  }

  return query;
}

export async function getAllBooks(
  sortMode: string = "newest",
  page: number = 1,
  pageSize: number = 20,
  filters?: AdvancedBookFilters
) {
  const { column, ascending } = getSortOptions(sortMode);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await buildBooksQuery(filters)
    .order(column, { ascending })
    .range(from, to);

  if (error) throw error;

  return {
    books: (data ?? []) as unknown as BookListItem[],
    totalCount: count ?? 0,
  };
}

export async function searchBooks(
  searchText: string,
  sortMode: string = "newest",
  page: number = 1,
  pageSize: number = 20,
  filters?: AdvancedBookFilters
) {
  const search = searchText.trim();
  const { column, ascending } = getSortOptions(sortMode);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await buildBooksQuery(filters)
    .or(`title.ilike.%${search}%,isbn.ilike.%${search}%`)
    .order(column, { ascending })
    .range(from, to);

  if (error) throw error;

  return {
    books: (data ?? []) as unknown as BookListItem[],
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

export async function getBookDetails(bookId: number): Promise<BookDetails> {
    const { data, error } = await supabase
        .from("Books")
        .select(`
            *,
            Publishers ( name, country ),
            BookAuthors ( Authors ( full_name ) ),
            BookGenres ( Genres ( name ) )
        `)
        .eq("id", bookId)
        .single();

    if (error) throw error;

    return data as unknown as BookDetails;
}

export async function updateBookInfo(bookId: number, bookData: BookInfoUpdate) {
    const { error } = await supabase.rpc("update_book", {
        p_book_id: bookId,
        p_title: bookData.title,
        p_subtitle: bookData.subtitle,
        p_edition: bookData.edition,
        p_language: bookData.language,
        p_publication_year: bookData.publication_year,
        p_publisher_name: bookData.publisher_name,
        p_publisher_country: bookData.publisher_country,
        p_authors: bookData.authors,
        p_genres: bookData.genres,
    });

    if (error) throw error;
}

// O estoque total é recalculado no banco como a soma das condições
export async function updateBookConditions(bookId: number, bookConditions: number[]) {
    const conditions = Object.fromEntries(
        bookConditions.map((quantity, index) => [`condition_${index}`, quantity]),
    );

    const { data, error } = await supabase.rpc("update_book_conditions", {
        p_book_id: bookId,
        p_conditions: conditions,
    });

    if (error) throw error;

    return data as number;
}

export async function deleteBook(bookId: number) {
    const { error } = await supabase.rpc("delete_book", {
        p_book_id: bookId,
    });

    if (error) throw error;
}
