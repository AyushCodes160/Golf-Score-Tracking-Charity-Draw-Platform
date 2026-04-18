-- Run this in your Supabase SQL Editor to configure the Draw Engine backend!

-- Track the history of monthly draws and total prize pools
create table draws (
  id uuid primary key default uuid_generate_v4(),
  ran_at timestamp with time zone default timezone('utc'::text, now()),
  winning_numbers integer[] not null,
  total_pool numeric not null,
  jackpot_payout numeric not null,
  tier_4_payout numeric not null,
  tier_3_payout numeric not null,
  charity_payout numeric not null
);

alter table draws enable row level security;
-- Anyone can view past draws for transparency
create policy "Anyone can view past draws" on draws for select using (true);

-- Track the snapshot of every user's scores at the time the draw was executed
create table draw_entries (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid references draws on delete cascade not null,
  user_id uuid references auth.users not null,
  matched_count integer not null default 0,
  score_snapshot integer[] not null,
  reward_won numeric default 0
);

alter table draw_entries enable row level security;
-- Users can only view their own historical lottery entries
create policy "Users can view their own draw entries" on draw_entries for select using (auth.uid() = user_id);

-- Add admin privileges to profiles (required for Admin Dashboard)
alter table profiles add column is_admin boolean default false not null;
