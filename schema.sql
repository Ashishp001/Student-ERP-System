-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  role text check (role in ('student', 'faculty', 'admin')),
  email text,
  phone text,
  course text,
  academic_year text,
  department text,
  address text,

  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- ---------------------------------------------------------
-- TRIGGER SYSTEM (MANDATORY FOR REGISTRATION TO WORK)
-- ---------------------------------------------------------
-- This function extracts the metadata we send from the JS code
-- and sticks it into our public profiles table.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username, role, phone, course, academic_year, department, address)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'course',
    new.raw_user_meta_data->>'academic_year',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'address'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Fire the function every time a new user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
