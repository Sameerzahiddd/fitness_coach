-- FitCoach AI — Supabase Schema
-- Run this in your Supabase SQL editor

-- Users table (stores onboarding profile)
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  age integer,
  fitness_level text check (fitness_level in ('beginner', 'intermediate', 'advanced')),
  goals text[] default '{}',
  equipment text[] default '{}',
  preferred_duration integer default 15,
  created_at timestamptz default now()
);

-- Workout plans (AI-generated, linked to user)
create table if not exists workout_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  plan jsonb not null,
  created_at timestamptz default now()
);

-- Sessions (each live coaching session)
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete set null,
  workout_type text not null,
  coach_personality text not null,
  duration integer not null,
  elapsed_seconds integer default 0,
  conversation_url text,
  conversation_id text,
  completed_at timestamptz default now()
);

-- Enable RLS (Row Level Security) — optional for demo
-- alter table users enable row level security;
-- alter table workout_plans enable row level security;
-- alter table sessions enable row level security;

-- Indexes
create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists workout_plans_user_id_idx on workout_plans(user_id);
