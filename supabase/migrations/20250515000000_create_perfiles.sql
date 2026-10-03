create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  dni varchar(8) unique not null,
  nombres varchar not null,
  apellidos varchar not null,
  email varchar not null,
  telefono varchar,
  fecha_nacimiento date,
  created_at timestamptz default now()
);

alter table public.perfiles enable row level security;

drop policy if exists "perfiles_insert" on public.perfiles;
drop policy if exists "perfiles_select" on public.perfiles;

create policy "perfiles_insert" on public.perfiles for insert to anon, authenticated with check (true);
create policy "perfiles_select" on public.perfiles for select to anon, authenticated using (true);
create policy "perfiles_update" on public.perfiles for update to anon, authenticated using (true);

-- Para bases que aún tienen profiles
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='profiles') then
    execute 'alter table public.profiles rename to perfiles_temp_old';
  end if;
end $$;
