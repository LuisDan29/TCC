-- ============================================================
-- Funções de edição e exclusão de livros.
-- Seguem o mesmo padrão de create_book (plpgsql, security invoker):
-- as políticas RLS configuradas no Supabase continuam valendo.
-- Cada função roda numa única transação: ou tudo é aplicado, ou nada.
-- ============================================================

-- 1) Editar informações bibliográficas (o ISBN NÃO é alterado) ---------------
create or replace function update_book (
  p_book_id smallint,
  p_title text,
  p_subtitle text,
  p_edition int,
  p_language text,
  p_publication_year int,
  p_publisher_name text,
  p_publisher_country text,
  p_authors text[],
  p_genres text[]
) returns smallint language plpgsql
set
  search_path = public as $$
declare
  v_publisher_id smallint;
begin
  -- Editora: reaproveita a existente (pelo nome) ou cria uma nova.
  -- Se ela já existe, só preenche o país quando o atual estiver vazio,
  -- para não alterar uma editora compartilhada com outros livros.
  insert into "Publishers" (name, country)
  values (p_publisher_name, p_publisher_country)
  on conflict (name) do update
    set country = case
      when coalesce("Publishers".country, '') = '' then excluded.country
      else "Publishers".country
    end;

  select id into v_publisher_id
  from "Publishers"
  where name = p_publisher_name;

  update "Books"
  set publisher_id     = v_publisher_id,
      title            = p_title,
      subtitle         = p_subtitle,
      edition          = p_edition,
      language         = p_language,
      publication_year = p_publication_year
  where id = p_book_id;

  -- Se nenhuma linha foi alterada, o livro não existe ou a RLS bloqueou.
  if not found then
    raise exception 'Livro não encontrado ou sem permissão para editar.'
      using errcode = 'P0002';
  end if;

  -- Autores: cria os que não existem e refaz só os vínculos DESTE livro.
  -- Os registros de Authors nunca são apagados (podem ser de outros livros).
  insert into "Authors" (full_name)
  select unnest(p_authors)
  on conflict (full_name) do nothing;

  delete from "BookAuthors" where book_id = p_book_id;

  insert into "BookAuthors" (book_id, author_id)
  select p_book_id, id from "Authors" where full_name = any(p_authors);

  -- Gêneros: mesma lógica dos autores.
  insert into "Genres" (name)
  select unnest(p_genres)
  on conflict (name) do nothing;

  delete from "BookGenres" where book_id = p_book_id;

  insert into "BookGenres" (book_id, genre_id)
  select p_book_id, id from "Genres" where name = any(p_genres);

  return p_book_id;
end;
$$;


-- 2) Editar quantidades por condição ----------------------------------------
-- Recalcula stock_quantity como a soma das condições, que é a regra usada
-- no cadastro (a soma das condições deve ser igual ao total).
create or replace function update_book_conditions (
  p_book_id smallint,
  p_conditions json
) returns int language plpgsql
set
  search_path = public as $$
declare
  v_total int;
begin
  if exists (
    select 1
    from json_each_text(p_conditions)
    where key !~ '^condition_[0-5]$' or value::int < 0
  ) then
    raise exception 'Quantidades por condição inválidas.'
      using errcode = '22023';
  end if;

  select coalesce(sum(value::int), 0) into v_total
  from json_each_text(p_conditions);

  update "Books"
  set conditions     = p_conditions,
      stock_quantity = v_total
  where id = p_book_id;

  if not found then
    raise exception 'Livro não encontrado ou sem permissão para editar.'
      using errcode = 'P0002';
  end if;

  return v_total;
end;
$$;


-- 3) Excluir o cadastro completo de um livro --------------------------------
-- Remove o livro e os vínculos dele com autores e gêneros.
-- Autores, gêneros e editoras NÃO são apagados (são compartilhados).
create or replace function delete_book (
  p_book_id smallint
) returns void language plpgsql
set
  search_path = public as $$
begin
  delete from "BookAuthors" where book_id = p_book_id;
  delete from "BookGenres"  where book_id = p_book_id;

  delete from "Books" where id = p_book_id;

  if not found then
    -- Desfaz também a remoção dos vínculos acima.
    raise exception 'Livro não encontrado ou sem permissão para excluir.'
      using errcode = 'P0002';
  end if;
end;
$$;
