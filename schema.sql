-- PARS Recruitment: run this in Supabase SQL Editor.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'applicant' check (role in ('applicant','admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null,
  state_name text not null,
  power text,
  kills text,
  heroes text,
  technology text,
  vehicle text,
  notes text,
  evidence_paths text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
create or replace function public.is_pars_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;
create policy "users read own profile" on public.profiles for select to authenticated using (id=auth.uid() or public.is_pars_admin());
create policy "users create own profile" on public.profiles for insert to authenticated with check (id=auth.uid() and role='applicant');
create policy "users read own applications and public approved" on public.applications for select to authenticated using (user_id=auth.uid() or status='approved' or public.is_pars_admin());
create policy "users submit own applications" on public.applications for insert to authenticated with check (user_id=auth.uid() and status='pending');
create policy "admin updates applications" on public.applications for update to authenticated using (public.is_pars_admin()) with check (public.is_pars_admin());
-- Create a Storage bucket named "evidence" and keep it PRIVATE.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('evidence','evidence',false,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "applicant uploads own evidence" on storage.objects for insert to authenticated
with check (bucket_id='evidence' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "applicant or admin reads evidence" on storage.objects for select to authenticated
using (bucket_id='evidence' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_pars_admin()));
-- After creating your own account, promote only your account to admin:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR_ADMIN_EMAIL');
-- Create profile rows automatically for new auth users:
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$ begin insert into public.profiles(id,role) values(new.id,'applicant') on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();