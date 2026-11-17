-- Títulos que precisam de ação: sem estoque OU com exemplares em condição
-- ruim (0 Irrecuperável, 1 Precária, 2 Desgastado). Já vem ordenado do mais
-- grave para o menos grave.
create or replace function get_attention_books ()
returns jsonb
language sql
stable
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id',             t.id,
        'title',          t.title,
        'isbn',           t.isbn,
        'authors',        t.authors,
        'stock_quantity', t.stock_quantity,
        'unusable',       t.unusable,
        'poor',           t.poor,
        'worn',           t.worn
      )
      order by (t.stock_quantity = 0) desc, t.unusable desc, t.poor desc, t.worn desc, t.title
    ),
    '[]'::jsonb
  )
  from (
    select b.id,
           b.title,
           b.isbn,
           b.stock_quantity,
           coalesce((b.conditions::jsonb ->> 'condition_0')::int, 0) as unusable,
           coalesce((b.conditions::jsonb ->> 'condition_1')::int, 0) as poor,
           coalesce((b.conditions::jsonb ->> 'condition_2')::int, 0) as worn,
           coalesce((
             select string_agg(a.full_name, ', ' order by a.full_name)
             from "BookAuthors" ba
             join "Authors" a on a.id = ba.author_id
             where ba.book_id = b.id
           ), '') as authors
    from "Books" b
  ) t
  where t.stock_quantity = 0
     or t.unusable > 0
     or t.poor > 0
     or t.worn > 0;
$$;