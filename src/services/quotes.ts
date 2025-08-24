import { supabase } from "@/integrations/supabase/client";
import { QuoteModel, UUID } from "@/lib/boq";

const TABLE = "quotes";

export async function createQuote(payload: Omit<QuoteModel, "id" | "user_id" | "created_at" | "updated_at">, userId: UUID) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ ...payload, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data as QuoteModel;
}

export async function updateQuote(id: UUID, patch: Partial<QuoteModel>) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...patch })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as QuoteModel;
}

export async function getQuote(id: UUID) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw error;
  return data as QuoteModel;
}

export async function listQuotes() {
  const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as QuoteModel[];
}

export async function deleteQuote(id: UUID) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
  return true;
}
