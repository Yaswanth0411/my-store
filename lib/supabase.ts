import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── TypeScript type matching our database schema ──────
export type DbProduct = {
  id:             number;
  name:           string;
  description:    string;
  price:          number;
  original_price: number | null;
  category:       string;
  rating:         number;
  reviews:        number;
  stock:          number;
  badge:          "new" | "sale" | "bestseller" | null;
  emoji:          string;
  created_at:     string;
};

export type DbOrder = {
  id:         string;
  total:      number;
  status:     string;
  shipping:   {
    firstName: string;
    lastName:  string;
    email:     string;
    address:   string;
    city:      string;
    zip:       string;
  };
  created_at: string;
};

export type DbOrderItem = {
  id:           number;
  order_id:     string;
  product_id:   number;
  product_name: string;
  price:        number;
  quantity:     number;
};