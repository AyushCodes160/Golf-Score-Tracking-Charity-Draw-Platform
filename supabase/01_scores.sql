-- Run this in your Supabase SQL Editor to configure Score tracking!

-- Create the scores table
create table scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  score integer not null constraint check_score_limit check (score >= 0 and score <= 54),
  played_at date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table scores enable row level security;

create policy "Users can insert their own scores" on scores 
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own scores" on scores 
  for select using (auth.uid() = user_id);

create policy "Users can delete their own scores" on scores 
  for delete using (auth.uid() = user_id);

-- Enforce the Rolling 5 Rule Algorithm
-- This executes every time a new score is added
create or replace function enforce_five_score_limit()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Isolate the user's scores, keep only the 5 most recent, delete the rest
  delete from scores
  where id in (
    select id from scores
    where user_id = new.user_id
    order by played_at desc, created_at desc
    offset 5
  );
  return new;
end;
$$;

create trigger trigger_enforce_five_score_limit
  after insert on scores
  for each row execute procedure enforce_five_score_limit();
