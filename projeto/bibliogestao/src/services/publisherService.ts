import { supabase } from "../lib/supabase-client";

export async function findOrCreatePublisher(name: string, country: string) {
  const { data: existingPublisher, error: selectError } = await supabase
    .from("Publishers")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingPublisher) {
    return existingPublisher.id;
  }

  const { data: newPublisher, error: insertError } = await supabase
    .from("Publishers")
    .insert({
      name,
      country,
    })
    .select("id")
    .single();

  if (insertError) {
    throw insertError;
  }

  return newPublisher.id;
}
