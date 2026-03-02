-- ============================================================
-- FULL REVERT OF TRICK STANDARDIZATION (ROBUST v4)
-- ============================================================

do $$
declare
    m record;
    target_id uuid;
begin
    -- 1. Restore core names with space (if they exist)
    update public.tricks set name = 'Big Spin' where name = 'Bigspin' and not exists (select 1 from public.tricks where name = 'Big Spin');
    update public.tricks set name = 'Half Cab' where name = 'Halfcab' and not exists (select 1 from public.tricks where name = 'Half Cab');
    
    -- 2. Restore directional flip names
    update public.tricks set name = 'Backside 180 Kickflip' where name = 'Backside Flip' and not exists (select 1 from public.tricks where name = 'Backside 180 Kickflip');
    update public.tricks set name = 'Frontside 180 Kickflip' where name = 'Frontside Flip' and not exists (select 1 from public.tricks where name = 'Frontside 180 Kickflip');
    update public.tricks set name = 'Backside 180 Heelflip' where name = 'Backside Heelflip' and not exists (select 1 from public.tricks where name = 'Backside 180 Heelflip');
    update public.tricks set name = 'Frontside 180 Heelflip' where name = 'Frontside Heelflip' and not exists (select 1 from public.tricks where name = 'Frontside 180 Heelflip');

    -- 3. Restore generic tricks (if deleted) from seed.sql definitions
    insert into public.tricks (name, category, difficulty, history, youtube_query) values
    ('Boardslide', 'street', 2, 'The board slides perpendicular to the obstacle (rail or ledge) with the middle of the board on the surface. A fundamental slide trick in street skating.', 'how to boardslide skateboard tutorial'),
    ('Noseslide', 'street', 2, 'The nose of the board slides along the obstacle while the tail is elevated. A very stylish and technical ledge trick.', 'how to noseslide skateboard tutorial'),
    ('Tailslide', 'street', 3, 'The tail of the board slides on the obstacle while the nose is elevated. Can be done frontside or backside.', 'how to tailslide skateboard tutorial'),
    ('Lipslide', 'street', 3, 'The board slides over the obstacle with the tail leading (opposite of a boardslide approach). The skater ollies over the obstacle and comes down on it sideways.', 'how to lipslide skateboard tutorial'),
    ('K-Grind', 'street', 3, 'An alternative name for the crooked grind, named because the grind position resembles the letter K. Very common in tech street skating.', 'k grind crooked grind skateboard tutorial'),
    ('Tre Flip', 'flatground', 3, 'Also known as a 360 flip, invented by Rodney Mullen. Combines a 360-degree backside pop shove-it with a kickflip simultaneously.', 'how to 360 flip tre flip skateboard tutorial')
    on conflict (name) do nothing;

    -- 4. Revert 360 Flip -> Tre Flip (Handle merges if necessary)
    for m in (
        select id, name, replace(name, '360 Flip', 'Tre Flip') as new_name
        from public.tricks 
        where name like '%360 Flip%'
    ) loop
        select id into target_id from public.tricks where name = m.new_name;
        if target_id is not null and target_id != m.id then
            -- Merge user progress to existing Tre Flip variant
            delete from public.user_tricks ut_s using public.user_tricks ut_t where ut_s.user_id = ut_t.user_id and ut_s.trick_id = m.id and ut_t.trick_id = target_id;
            update public.user_tricks set trick_id = target_id where trick_id = m.id;
            delete from public.tricks where id = m.id;
        else
            update public.tricks set name = m.new_name where id = m.id;
        end if;
    end loop;
    
    -- 5. Restore specific grinds (if deleted)
    insert into public.tricks (name, category, difficulty, youtube_query) values
    ('50-50 Grind', 'ledge/rail', 2, 'how to 50-50 grind skateboard tutorial'),
    ('5-0 Grind', 'ledge/rail', 3, 'how to 5-0 grind skateboard tutorial'),
    ('Nosegrind', 'ledge/rail', 3, 'how to nosegrind skateboard tutorial'),
    ('Smith Grind', 'ledge/rail', 3, 'how to smith grind skateboard tutorial'),
    ('Feeble Grind', 'ledge/rail', 3, 'how to feeble grind skateboard tutorial'),
    ('Crooked Grind', 'ledge/rail', 3, 'how to crooked grind skateboard tutorial'),
    ('Blunt Slide', 'ledge/rail', 4, 'how to blunt slide skateboard tutorial'),
    ('Bluntslide', 'ledge/rail', 4, 'bluntslide skateboard tutorial'),
    ('Nosebluntslide', 'ledge/rail', 4, 'nosebluntslide skateboard tutorial'),
    ('Nose Blunt Grind', 'ledge/rail', 4, 'nose blunt grind skateboard tutorial')
    on conflict (name) do nothing;

end $$;
