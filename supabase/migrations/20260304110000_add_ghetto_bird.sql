insert into tricks (name, category, difficulty, youtube_query)
values ('Ghetto Bird', 'flatground', 4, 'ghetto bird hardflip tutorial')
on conflict (name) do update set category = excluded.category, difficulty = excluded.difficulty, youtube_query = excluded.youtube_query;
