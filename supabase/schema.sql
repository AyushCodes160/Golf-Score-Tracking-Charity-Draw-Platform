-- Run these commands in your Supabase SQL Editor

-- 1. Create the Charities table
create table charities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  tag text not null,
  description text not null,
  image_url text not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS (Row Level Security)
alter table charities enable row level security;

-- Allow public read access (everyone can see the active charities)
create policy "Public can view active charities" on charities
  for select using (active = true);

-- Add the sample charities
insert into charities (name, tag, description, image_url) values
('Wellspring Initiative', 'Clean water', 'Funds community-maintained water points and sanitation training across rural Malawi and Kenya. Every point serves ~400 people for a decade.', '/src/assets/charity-water.jpg'),
('Open Shelf Foundation', 'Education', 'Builds classroom libraries and funds teacher stipends in regions where secondary education is rationed by distance, not ability.', '/src/assets/charity-education.jpg'),
('Rooted Commons', 'Climate', 'Community-led reforestation with native species. Every £6 plants and maintains a sapling to sequestering maturity — no carbon offset shell games.', '/src/assets/charity-climate.jpg'),
('The Long Table', 'Food security', 'Supports a network of community kitchens serving warm meals with dignity. No queues, no means-test, no forms. Just food.', '/src/assets/charity-food.jpg');

-- 2. Setup User profiles
create table profiles (
  id uuid references auth.users not null primary key,
  subscription_status text default 'inactive',
  stripe_customer_id text,
  chosen_charity_id uuid references charities(id),
  charity_allocation_pct integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger to create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
