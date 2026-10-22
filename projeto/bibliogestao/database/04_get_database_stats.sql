create or replace function get_dashboard_stats ()
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(

    -- Cards de KPI
    'totals', (
      select jsonb_build_object(
        'titles',               count(*),
        'copies',               coalesce(sum(stock_quantity), 0),
        'titles_without_stock', count(*) filter (where stock_quantity = 0),
        'authors',              (select count(*) from "Authors"),
        'genres',               (select count(*) from "Genres"),
        'publishers',           (select count(*) from "Publishers")
      )
      from "Books"
    ),

    -- Exemplares por condição (0 a 5), somando todos os livros
    'conditions', (
      select coalesce(
        jsonb_agg(jsonb_build_object('condition', n, 'quantity', q) order by n),
        '[]'::jsonb
      )
      from (
        select s.n,
               coalesce(sum((b.conditions::jsonb ->> ('condition_' || s.n))::int), 0) as q
        from generate_series(0, 5) as s(n)
        left join "Books" b on true
        group by s.n
      ) c
    ),

    -- 10 gêneros com mais títulos
    'top_genres', (
      select coalesce(
        jsonb_agg(jsonb_build_object('name', name, 'total', total) order by total desc, name),
        '[]'::jsonb
      )
      from (
        select g.name, count(*) as total
        from "BookGenres" bg
        join "Genres" g on g.id = bg.genre_id
        group by g.name
        order by total desc, g.name
        limit 10
      ) t
    ),

    -- 10 autores com mais títulos
    'top_authors', (
      select coalesce(
        jsonb_agg(jsonb_build_object('name', name, 'total', total) order by total desc, name),
        '[]'::jsonb
      )
      from (
        select a.full_name as name, count(*) as total
        from "BookAuthors" ba
        join "Authors" a on a.id = ba.author_id
        group by a.full_name
        order by total desc, a.full_name
        limit 10
      ) t
    ),

    -- Títulos por década de publicação
    'by_decade', (
      select coalesce(
        jsonb_agg(jsonb_build_object('decade', decade, 'total', total) order by decade),
        '[]'::jsonb
      )
      from (
        select (publication_year / 10) * 10 as decade, count(*) as total
        from "Books"
        where publication_year is not null
        group by 1
      ) d
    ),

    -- Títulos por idioma
    'by_language', (
      select coalesce(
        jsonb_agg(jsonb_build_object('language', language, 'total', total) order by total desc),
        '[]'::jsonb
      )
      from (
        select coalesce(nullif(trim(language), ''), 'Não informado') as language,
               count(*) as total
        from "Books"
        group by 1
      ) l
    ),

    -- Cadastros por mês, últimos 12 meses (meses sem cadastro aparecem com 0)
    'by_month', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object('month', to_char(m.month, 'YYYY-MM'), 'total', coalesce(c.total, 0))
          order by m.month
        ),
        '[]'::jsonb
      )
      from generate_series(
             date_trunc('month', now()) - interval '11 months',
             date_trunc('month', now()),
             interval '1 month'
           ) as m(month)
      left join (
        select date_trunc('month', created_at) as month, count(*) as total
        from "Books"
        group by 1
      ) c on c.month = m.month
    )

  );
$$;