import { supabase } from "../lib/supabase-client";

export async function getOrCreateGenres(genres: string[]) {
  const genreIds: number[] = [];

  for (const name of genres) {
    const { data: existingGenre, error: selectError } = await supabase
      .from("Genres")
      .select("id")
      .eq("name", name)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    if (existingGenre) {
      genreIds.push(existingGenre.id);
      continue;
    }

    const { data: newGenre, error: insertError } = await supabase
      .from("Genres")
      .insert({ name })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    genreIds.push(newGenre.id);
  }

  return genreIds;
}
