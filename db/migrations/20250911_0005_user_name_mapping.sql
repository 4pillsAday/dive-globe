-- Accept both full_name and name; fall back to email's local-part
create or replace function public.sync_auth_user_to_public_users()
returns trigger
language plpgsql
security definer
as $$
declare
  v_display_name text;
  v_avatar text;
begin
  v_display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  v_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture'
  );

  insert into public.users(id, email, display_name, avatar_url)
  values (new.id, new.email, v_display_name, v_avatar)
  on conflict (id) do update
    set email        = excluded.email,
        display_name = excluded.display_name,
        avatar_url   = excluded.avatar_url,
        updated_at   = now();

  return new;
end;
$$;

-- Rewire triggers to use the new function and also fire on metadata updates
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.sync_auth_user_to_public_users();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_auth_user_to_public_users();
