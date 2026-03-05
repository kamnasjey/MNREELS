-- Increment user tasalbar balance (used by server actions)
create or replace function public.increment_balance(user_id uuid, amount integer)
returns void as $$
begin
  update public.profiles
  set tasalbar_balance = tasalbar_balance + amount,
      updated_at = now()
  where id = user_id;
end;
$$ language plpgsql security definer;

-- Search series by text
create or replace function public.search_series(query text)
returns setof public.series as $$
begin
  return query
    select * from public.series
    where is_published = true
    and (
      title ilike '%' || query || '%'
      or description ilike '%' || query || '%'
      or category ilike '%' || query || '%'
    )
    order by total_views desc
    limit 20;
end;
$$ language plpgsql;

-- Get continue watching list
create or replace function public.get_continue_watching(p_user_id uuid)
returns table (
  series_id uuid,
  series_title text,
  series_cover text,
  series_gradient text,
  total_episodes bigint,
  watched_episodes bigint,
  last_episode_number integer,
  last_watched timestamptz
) as $$
begin
  return query
    select
      s.id as series_id,
      s.title as series_title,
      s.cover_url as series_cover,
      '' as series_gradient,
      (select count(*) from episodes where series_id = s.id and status = 'published') as total_episodes,
      count(distinct wh.episode_id) as watched_episodes,
      max(e.episode_number) as last_episode_number,
      max(wh.last_watched_at) as last_watched
    from watch_history wh
    join episodes e on e.id = wh.episode_id
    join series s on s.id = e.series_id
    where wh.user_id = p_user_id
    group by s.id, s.title, s.cover_url
    order by max(wh.last_watched_at) desc
    limit 10;
end;
$$ language plpgsql;
