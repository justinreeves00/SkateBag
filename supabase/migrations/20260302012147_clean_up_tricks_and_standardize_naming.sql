-- ============================================================
-- CLEAN UP TRICKS & STANDARDIZE NAMING (REFINED v3)
-- ============================================================

-- 1. Create temporary table for missing directional variants
create temp table missing_tricks (
  name text,
  category text,
  difficulty integer,
  youtube_query text
);

insert into missing_tricks (name, category, difficulty, youtube_query) values
('Backside 50-50', 'ledge/rail', 2, 'how to backside 50-50 skateboard'),
('Frontside 50-50', 'ledge/rail', 2, 'how to frontside 50-50 skateboard'),
('Backside 5-0', 'ledge/rail', 3, 'how to backside 5-0 skateboard'),
('Frontside 5-0', 'ledge/rail', 3, 'how to frontside 5-0 skateboard'),
('Backside Nosegrind', 'ledge/rail', 3, 'how to backside nosegrind skateboard'),
('Frontside Nosegrind', 'ledge/rail', 3, 'how to frontside nosegrind skateboard'),
('Backside Smith Grind', 'ledge/rail', 3, 'how to backside smith grind skateboard'),
('Frontside Smith Grind', 'ledge/rail', 3, 'how to frontside smith grind skateboard'),
('Backside Feeble Grind', 'ledge/rail', 3, 'how to backside feeble grind skateboard'),
('Frontside Feeble Grind', 'ledge/rail', 3, 'how to frontside feeble grind skateboard'),
('Backside Crooked Grind', 'ledge/rail', 3, 'how to backside crooked grind skateboard'),
('Frontside Crooked Grind', 'ledge/rail', 3, 'how to frontside crooked grind skateboard'),
('Backside Bluntslide', 'ledge/rail', 4, 'how to backside bluntslide skateboard'),
('Frontside Bluntslide', 'ledge/rail', 4, 'how to frontside bluntslide skateboard'),
('Backside Nosebluntslide', 'ledge/rail', 4, 'how to backside nosebluntslide skateboard'),
('Frontside Nosebluntslide', 'ledge/rail', 4, 'how to frontside nosebluntslide skateboard'),
('Backside Flip', 'flatground', 3, 'how to backside flip skateboard tutorial'),
('Frontside Flip', 'flatground', 3, 'how to frontside flip skateboard tutorial'),
('Bigspin', 'flatground', 3, 'how to bigspin skateboard tutorial'),
('Halfcab', 'flatground', 2, 'how to halfcab skateboard tutorial');

-- Insert them if they don't exist
insert into public.tricks (name, category, difficulty, youtube_query)
select name, category, difficulty, youtube_query 
from missing_tricks
where not exists (select 1 from public.tricks where public.tricks.name = missing_tricks.name);

-- 2. Merge Redundant/Synonym Tricks
do $$
declare
    m record;
    source_id uuid;
    target_id uuid;
begin
    -- Define pairs to merge: (Redundant Name, Standard Name)
    for m in (
        select * from (values 
            ('Backside 180 Kickflip', 'Backside Flip'),
            ('Frontside 180 Kickflip', 'Frontside Flip'),
            ('Backside 180 Heelflip', 'Backside Heelflip'),
            ('Frontside 180 Heelflip', 'Frontside Heelflip'),
            ('Big Spin', 'Bigspin'),
            ('Half Cab', 'Halfcab'),
            ('K-Grind', 'Backside Crooked Grind'),
            ('Crooked Grind', 'Backside Crooked Grind'),
            ('Frontside Crooks', 'Frontside Crooked Grind'),
            ('Blunt Slide', 'Backside Bluntslide'),
            ('Bluntslide', 'Backside Bluntslide'),
            ('Frontside Blunt', 'Frontside Bluntslide'),
            ('Backside Blunt', 'Backside Bluntslide'),
            ('Noseblunt Slide', 'Backside Nosebluntslide'),
            ('Nosebluntslide', 'Backside Nosebluntslide'),
            ('Backside Noseblunt Slide', 'Backside Nosebluntslide'),
            ('Nose Blunt Grind', 'Backside Nosebluntslide'),
            ('50-50 Grind', 'Backside 50-50'),
            ('5-0 Grind', 'Backside 5-0'),
            ('Nosegrind', 'Backside Nosegrind'),
            ('Smith Grind', 'Backside Smith Grind'),
            ('Feeble Grind', 'Backside Feeble Grind'),
            ('Boardslide', 'Backside Boardslide'),
            ('Noseslide', 'Backside Noseslide'),
            ('Tailslide', 'Backside Tailslide'),
            ('Lipslide', 'Backside Lipslide'),
            ('Tre Flip', '360 Flip'),
            ('Tré Flip', '360 Flip'),
            ('Nollie Tre Flip', 'Nollie 360 Flip'),
            ('Switch Tre Flip', 'Switch 360 Flip'),
            ('Fakie Tre Flip', 'Fakie 360 Flip'),
            ('Big Spin Nosegrind', 'Bigspin Nosegrind'),
            ('Fakie Big Spin', 'Fakie Bigspin'),
            ('Nollie Big Spin', 'Nollie Bigspin'),
            ('Switch Bigspin', 'Switch Bigspin') -- just in case
        ) as t(s, t)
    ) loop
        select id into source_id from public.tricks where name = m.s;
        select id into target_id from public.tricks where name = m.t;
        
        if source_id is not null and target_id is not null then
            -- Delete user tricks from source that already exist in target to avoid conflict
            delete from public.user_tricks ut_s
            using public.user_tricks ut_t
            where ut_s.user_id = ut_t.user_id 
              and ut_s.trick_id = source_id 
              and ut_t.trick_id = target_id;

            -- Move remaining user progress to target
            update public.user_tricks set trick_id = target_id where trick_id = source_id;
            
            -- Move suggestions to target
            update public.trick_suggestions set trick_id = target_id where trick_id = source_id;
            
            -- Delete the source trick
            delete from public.tricks where id = source_id;
        elsif source_id is not null then
            -- If target doesn't exist, just rename the source
            update public.tricks set name = m.t where id = source_id;
        end if;
    end loop;

    -- Update remaining catch-all variants (like 'Tre Flip to Boardslide')
    -- We do this one by one to avoid unique constraint issues
    for m in (
        select id, replace(replace(name, 'Tre Flip', '360 Flip'), 'Tré Flip', '360 Flip') as new_name
        from public.tricks 
        where name like '%Tre Flip%' or name like '%Tré Flip%'
    ) loop
        -- If the new name already exists, merge
        select id into target_id from public.tricks where name = m.new_name;
        if target_id is not null then
            delete from public.user_tricks ut_s using public.user_tricks ut_t where ut_s.user_id = ut_t.user_id and ut_s.trick_id = m.id and ut_t.trick_id = target_id;
            update public.user_tricks set trick_id = target_id where trick_id = m.id;
            delete from public.tricks where id = m.id;
        else
            update public.tricks set name = m.new_name where id = m.id;
        end if;
    end loop;

end $$;
