alter table "Books"       add constraint books_isbn_key        unique (isbn);
alter table "Authors"     add constraint authors_full_name_key unique (full_name);
alter table "Genres"      add constraint genres_name_key       unique (name);
alter table "Publishers"  add constraint publishers_name_key   unique (name);
alter table "BookAuthors" add constraint book_authors_key      unique (book_id, author_id);
alter table "BookGenres"  add constraint book_genres_key       unique (book_id, genre_id);