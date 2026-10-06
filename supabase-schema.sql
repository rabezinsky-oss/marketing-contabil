-- MARKETING CONTÁBIL — AUTENTICAÇÃO COM APROVAÇÃO
-- Execute este SQL no SQL Editor do Supabase.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'user' check (role in ('user','admin')),
  status text not null default 'pending' check (status in ('pending','approved','blocked','rejected')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'approved'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário'),
    lower(new.email),
    'pending'
  )
  on conflict (id) do update set name=excluded.name, email=excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Cada usuário pode ler apenas o próprio perfil.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

-- Usuário não pode editar o próprio status/role. Administrador pode alterar perfis.
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

-- Admin pode inserir manualmente um perfil, se necessário.
drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin"
on public.profiles for insert
with check (public.is_admin());

-- Permite ao próprio usuário atualizar somente nome/e-mail? Para manter o fluxo simples,
-- as alterações de perfil ficam restritas ao administrador.

-- Depois de criar sua conta no aplicativo, execute:
-- update public.profiles
-- set role = 'admin', status = 'approved'
-- where email = 'SEU_EMAIL_AQUI';
