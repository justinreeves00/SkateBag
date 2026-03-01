-- ============================================================
-- Update More Tricks History, Inventors, and Years
-- ============================================================

-- PRESSURE FLIP
update public.tricks set 
  inventor = 'Rodney Mullen / Chris Fissel',
  year = 1983,
  history = 'Origin: 1983 - A trick where the board is flipped using only the pressure of the back foot. Mullen invented the 360 version, while Fissel created the straight variant. | Creator: Rodney Mullen / Chris Fissel'
where name ilike '%Pressure Flip%';

-- DOLPHIN FLIP / FORWARD FLIP
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1983,
  history = 'Origin: 1983 - Also known as the forward flip or murder flip. The board flips nose-down between the legs in a vertical rotation. | Creator: Rodney Mullen'
where name ilike '%Dolphin Flip%' or name ilike '%Forward Flip%';

-- GAZELLE FLIP
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1981,
  history = 'Origin: 1981 - A 360-degree board rotation combined with a 540-degree body rotation and a kickflip. Originally a freestyle trick. | Creator: Rodney Mullen'
where name ilike '%Gazelle Flip%';

-- HOSPITAL FLIP
update public.tricks set 
  inventor = 'Masahiro Fujii',
  year = 1990,
  history = 'Origin: 1990s - A variation of the Casper flip where the front foot stays in contact with the board to guide it back around. | Creator: Masahiro Fujii'
where name ilike '%Hospital Flip%';

-- BLUNT SLIDE / NOSEBLUNT SLIDE
update public.tricks set 
  inventor = 'Mark Gonzales / Julien Stranger',
  year = 1989,
  history = 'Origin: Late 1980s - Sliding on the tail or nose with the wheels over the edge. Gonzales pioneered the street noseblunt in Video Days. | Creator: Mark Gonzales / Julien Stranger'
where name ilike '%Blunt Slide%';

-- HURRICANE
update public.tricks set 
  inventor = 'Neil Blender',
  year = 1985,
  history = 'Origin: 1985 - A grind where the back truck locks on while the board is rotated 180 degrees into a switch position. | Creator: Neil Blender'
where name ilike '%Hurricane%';

-- WILLY GRIND
update public.tricks set 
  inventor = 'Derek Williams',
  year = 1990,
  history = 'Origin: 1990s - A grind where the front truck is dragged behind the back truck on the obstacle. Named after Williams. | Creator: Derek Williams'
where name ilike '%Willy Grind%';

-- LOSI GRIND
update public.tricks set 
  inventor = 'Allen Losi',
  year = 1985,
  history = 'Origin: 1980s - A grind on the front truck while the tail is angled outward. Pioneer move in technical street skating. | Creator: Allen Losi'
where name ilike '%Losi Grind%';

-- OVERCROOK
update public.tricks set 
  inventor = 'Dan Peterka',
  year = 1990,
  history = 'Origin: 1990s - A crooked grind where the nose of the board hangs over the far side of the obstacle. | Creator: Dan Peterka'
where name ilike '%Overcrook%';

-- BENIHANA
update public.tricks set 
  inventor = 'Lester Kasai',
  year = 1985,
  history = 'Origin: 1980s - A tail grab where the back foot is kicked off the board. Often criticized for style but historically iconic. | Creator: Lester Kasai'
where name ilike '%Benihana%';

-- JUDO AIR
update public.tricks set 
  inventor = 'Adrian Demain',
  year = 1984,
  history = 'Origin: 1984 - A frontside grab where the front foot is kicked off the board in a karate-like motion. | Creator: Adrian Demain'
where name ilike '%Judo Air%';

-- METHOD AIR
update public.tricks set 
  inventor = 'Neil Blender',
  year = 1985,
  history = 'Origin: 1985 - An air where the board is pulled up toward the back and the body is arched. Named for the "method" of execution. | Creator: Neil Blender'
where name ilike '%Method Air%';

-- DRAGON FLIP
update public.tricks set 
  inventor = 'Chris Chann (Popularized)',
  year = 2014,
  history = 'Origin: 2010s - A 360-degree Dolphin Flip. Rebranded and popularized by modern technical innovator Chris Chann. | Creator: Chris Chann'
where name ilike '%Dragon Flip%';

-- BIGSPIN KICKFLIP
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1990,
  history = 'Origin: 1990s - A combination of a Big Spin (360 board/180 body) and a Kickflip. Technical street mastery. | Creator: Rodney Mullen'
where name ilike '%Bigspin Kickflip%';

-- VARIAL KICKFLIP
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1983,
  history = 'Origin: 1983 - A combination of a pop shove-it and a kickflip. A staple of 90s street skating. | Creator: Rodney Mullen'
where name ilike '%Varial Kickflip%';

-- VARIAL HEELFLIP
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1983,
  history = 'Origin: 1983 - A combination of a frontside shove-it and a heelflip. | Creator: Rodney Mullen'
where name ilike '%Varial Heelflip%';

-- DISCO FLIP
update public.tricks set 
  history = 'Origin: Informal name for a Heelflip with a body varial or a Fakie 360 Flip variant depending on regional slang.'
where name ilike '%Disco Flip%';

-- 540 FLIP
update public.tricks set 
  history = 'Origin: An advanced technical flip combining a 540-degree shove-it with a kickflip.'
where name ilike '%540 Flip%';

-- STALEFISH
update public.tricks set 
  inventor = 'Tony Hawk',
  year = 1985,
  history = 'Origin: 1985 - A grab where the back hand holds the heelside edge behind the legs. Named after a "stale fish" lunch. | Creator: Tony Hawk'
where name ilike '%Stalefish%';

-- MADONNA
update public.tricks set 
  inventor = 'Tony Hawk',
  year = 1986,
  history = 'Origin: 1986 - A frontside air where the front foot is kicked off while the board is grabbed. | Creator: Tony Hawk'
where name ilike '%Madonna%';

-- AIRWALK
update public.tricks set 
  inventor = 'Tony Hawk',
  year = 1983,
  history = 'Origin: 1983 - The skater kicks their feet off in opposite directions while airborne. Adapted from vert to flatground. | Creator: Tony Hawk'
where name ilike '%Airwalk%';

-- BONLESS
update public.tricks set 
  inventor = 'Garry Scott Davis (GSD)',
  year = 1980,
  history = 'Origin: 1980 - Stepping one foot off to jump while grabbing the board. A foundational old-school street trick. | Creator: Garry Scott Davis'
where name ilike '%Boneless%';

-- NATAS SPIN
update public.tricks set 
  inventor = 'Natas Kaupas',
  year = 1980,
  history = 'Origin: 1980s - Spinning on top of a post or hydrant. Named after street pioneer Natas Kaupas. | Creator: Natas Kaupas'
where name ilike '%Natas Spin%';

-- FASTPLANT
update public.tricks set 
  inventor = 'Neil Blender',
  year = 1980,
  history = 'Origin: 1980s - A boneless variation where the back foot plants on the ground. | Creator: Neil Blender'
where name ilike '%Fastplant%';

-- SLAPPY GRIND
update public.tricks set 
  inventor = 'John Lucero',
  year = 1980,
  history = 'Origin: 1980s - Grinding a curb or ledge without an ollie. Lucero pioneered this stylish transition move. | Creator: John Lucero'
where name ilike '%Slappy%';
