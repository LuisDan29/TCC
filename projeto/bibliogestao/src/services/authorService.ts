import { supabase } from "../lib/supabase-client";

export async function getOrCreateAuthors(authors: string[]) {
  const authorIds: number[] = [];

  for (const name of authors) {
    const { data: existingAuthor, error: selectError } = await supabase
      .from("Authors")
      .select("id")
      .eq("full_name", name)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    if (existingAuthor) {
      authorIds.push(existingAuthor.id);
      continue;
    }

    const { data: newAuthor, error: insertError } = await supabase
      .from("Authors")
      .insert({ full_name: name })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    authorIds.push(newAuthor.id);
  }

  return authorIds;
}
