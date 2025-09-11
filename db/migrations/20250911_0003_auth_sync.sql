-- Mirror auth.users -> public.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users(id, email, display_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do update
    set email = excluded.email,
        display_name = excluded.display_name,
        avatar_url = excluded.avatar_url,
        updated_at = now();
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
