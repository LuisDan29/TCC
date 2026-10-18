create or replace function create_book (
  p_isbn text,
  p_title text,
  p_subtitle text,
  p_edition int,
  p_language text,
  p_publication_year int,
  p_stock_quantity int,
  p_conditions json,
  p_publisher_name text,
  p_publisher_country text,
  p_authors text[],
  p_genres text[]
) returns smallint language plpgsql
set
  search_path = public as $$
declare
  v_publisher_id smallint;                
  v_book_id smallint;                    
begin
  insert into "Publishers" (name, country)
  values (p_publisher_name, p_publisher_country)
  on conflict (name) do nothing;

  select id into v_publisher_id
  from "Publishers"
  where name = p_publisher_name;

  insert into "Books" (publisher_id, isbn, title, subtitle, edition, language,
                       publication_year, stock_quantity, conditions)
  values (v_publisher_id, p_isbn, p_title, p_subtitle, p_edition, p_language,
          p_publication_year, p_stock_quantity, p_conditions)
  returning id into v_book_id;

  insert into "Authors" (full_name)
  select unnest(p_authors)
  on conflict (full_name) do nothing;

  insert into "BookAuthors" (book_id, author_id)
  select v_book_id, id from "Authors" where full_name = any(p_authors);

  insert into "Genres" (name)
  select unnest(p_genres)
  on conflict (name) do nothing;

  insert into "BookGenres" (book_id, genre_id)
  select v_book_id, id from "Genres" where name = any(p_genres);

  return v_book_id;
end;
$$;