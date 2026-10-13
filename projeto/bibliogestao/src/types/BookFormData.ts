export type BookFormdata = {
  // Book
  isbn: string;
  title: string;
  subtitle: string;
  edition: number;
  language: string;
  publication_year: number;

  // Genres
  genres: string[];

  // Authors
  authors: string[];

  // Publisher
  publisher_name: string;
  publisher_country: string;

  // Collection
  number_books_inserted: number;
  book_conditions: number[];
};
