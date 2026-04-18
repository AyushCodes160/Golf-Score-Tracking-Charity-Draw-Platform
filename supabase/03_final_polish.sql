-- 1. Prevent duplicate dates for the same user in 'scores' table
ALTER TABLE scores ADD CONSTRAINT scores_user_date_idx UNIQUE (user_id, played_at);

-- 2. Add Verification status and proof URL to draw_entries
-- This tracks if a winner has uploaded their scorecard screenshot.
ALTER TABLE draw_entries 
ADD COLUMN verification_status text DEFAULT 'pending_upload' CHECK (verification_status IN ('pending_upload', 'pending_review', 'approved')),
ADD COLUMN proof_image_url text;

-- 3. Add charity allocation percentage slider preference to profiles (default 10%)
ALTER TABLE profiles 
ADD COLUMN charity_allocation_pct numeric DEFAULT 10 CHECK (charity_allocation_pct >= 10 AND charity_allocation_pct <= 100);

-- 4. Create a Public Storage Bucket for winning scorecard screenshots
-- If it already exists, this command does nothing.
insert into storage.buckets (id, name, public) 
values ('winner_proofs', 'winner_proofs', true)
on conflict do nothing;

-- Ensure anyone can read the storage bucket
create policy "Anyone can read winner_proofs" on storage.objects 
  for select 
  using (bucket_id = 'winner_proofs');

-- Allow authenticated users to upload their own proofs
create policy "Authenticated users can upload winner_proofs" on storage.objects 
  for insert 
  with check (bucket_id = 'winner_proofs' AND auth.role() = 'authenticated');
