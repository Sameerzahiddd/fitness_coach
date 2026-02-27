import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase is optional — app works without it using localStorage
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseEnabled = !!supabase;

// ── User Profile ────────────────────────────────────────────────
export async function saveUserProfile(profile: Record<string, unknown>) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('users')
    .insert([profile])
    .select()
    .single();
  if (error) { console.error('Supabase error:', error); return null; }
  return data;
}

export async function getUserProfile(userId: string) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

// ── Workout Plans ────────────────────────────────────────────────
export async function saveWorkoutPlan(userId: string, plan: Record<string, unknown>) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('workout_plans')
    .insert([{ user_id: userId, plan }])
    .select()
    .single();
  if (error) { console.error('Supabase error:', error); return null; }
  return data;
}

// ── Sessions ─────────────────────────────────────────────────────
export async function saveSession(session: {
  user_id?: string;
  workout_type: string;
  coach_personality: string;
  duration: number;
  conversation_url?: string;
}) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sessions')
    .insert([session])
    .select()
    .single();
  if (error) { console.error('Supabase error:', error); return null; }
  return data;
}
