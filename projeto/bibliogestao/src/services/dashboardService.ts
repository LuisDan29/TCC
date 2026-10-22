import { supabase } from "../lib/supabase-client";

export interface DashboardTotals {
  titles: number;
  copies: number;
  titles_without_stock: number;
  authors: number;
  genres: number;
  publishers: number;
}

// Exemplares por condição (0 a 5, mesmo índice de BOOK_CONDITIONS)
export interface ConditionStat {
  condition: number;
  quantity: number;
}

// Usado em top_genres e top_authors
export interface NameTotal {
  name: string;
  total: number;
}

export interface DecadeStat {
  decade: number; // ex.: 2010
  total: number;
}

export interface LanguageStat {
  language: string;
  total: number;
}

export interface MonthStat {
  month: string; // formato "YYYY-MM"
  total: number;
}

export interface DashboardStats {
  totals: DashboardTotals;
  conditions: ConditionStat[];
  top_genres: NameTotal[];
  top_authors: NameTotal[];
  by_decade: DecadeStat[];
  by_language: LanguageStat[];
  by_month: MonthStat[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase.rpc("get_dashboard_stats");

  if (error) throw error;
  if (!data)
    throw new Error("A função get_dashboard_stats não retornou dados.");

  return data as unknown as DashboardStats;
}
