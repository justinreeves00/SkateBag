-- ============================================================
-- Update Tricks History, Inventors, and Years
-- ============================================================

-- OLLIE FAMILY
update public.tricks set 
  inventor = 'Alan "Ollie" Gelfand (Vert) / Rodney Mullen (Flatground)',
  year = 1978,
  history = 'Origin: 1978 (Vert) / 1982 (Flatground) - The most foundational trick of modern skateboarding. Invented by Gelfand in a bowl and adapted to flatground by Mullen. | Creator: Alan Gelfand / Rodney Mullen'
where name ilike '%Ollie%' and name not ilike '%Nollie%';

-- NOLLIE
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1982,
  history = 'Origin: 1982 - An ollie performed from the nose. Named as a combination of "nose" and "ollie." | Creator: Rodney Mullen'
where name ilike '%Nollie%';

-- KICKFLIP FAMILY
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1982,
  history = 'Origin: 1982 - Originally called the "magic flip," it revolutionized street skating by allowing the board to flip under the rider''s feet. | Creator: Rodney Mullen'
where name ilike '%Kickflip%';

-- HEELFLIP FAMILY
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1982,
  history = 'Origin: 1982 - Created alongside the kickflip, using the heel to flick the board in the opposite direction. | Creator: Rodney Mullen'
where name ilike '%Heelflip%';

-- IMPOSSIBLE FAMILY
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1982,
  history = 'Origin: 1982 - The board wraps vertically over the back foot in a 360-degree rotation. Named for its perceived difficulty. | Creator: Rodney Mullen'
where name ilike '%Impossible%';

-- 360 FLIP FAMILY (Tre Flip)
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1983,
  history = 'Origin: 1983 - A combination of a 360-degree backside pop shove-it and a kickflip. One of the most iconic street tricks. | Creator: Rodney Mullen'
where name ilike '%360 Flip%' or name ilike '%Tre Flip%';

-- POP SHOVE-IT FAMILY
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1982,
  history = 'Origin: 1982 - An ollie combined with a 180-degree board rotation. The modern popped version was refined in the early 80s. | Creator: Rodney Mullen'
where name ilike '%Pop Shove-it%';

-- HARDFLIP FAMILY
update public.tricks set 
  inventor = 'Dan Peterka',
  year = 1990,
  history = 'Origin: Early 1990s - A technical combination of a frontside shove-it and a kickflip. Popularized during the technical street era. | Creator: Dan Peterka'
where name ilike '%Hardflip%';

-- INWARD HEELFLIP FAMILY
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1983,
  history = 'Origin: 1983 - A combination of a backside shove-it and a heelflip, flipping inward toward the skater. | Creator: Rodney Mullen'
where name ilike '%Inward Heelflip%';

-- LASER FLIP FAMILY
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1983,
  history = 'Origin: 1983 - A combination of a frontside 360 shove-it and a heelflip. Considered one of the hardest technical flips. | Creator: Rodney Mullen'
where name ilike '%Laser Flip%';

-- CABALLERIAL FAMILY
update public.tricks set 
  inventor = 'Steve Caballero',
  year = 1981,
  history = 'Origin: 1981 - Originally a fakie 360 ollie invented on vert. The Half Cab is its 180-degree flatground variant. | Creator: Steve Caballero'
where name ilike '%Caballerial%' or name ilike '%Half Cab%';

-- GHETTO BIRD
update public.tricks set 
  inventor = 'Kareem Campbell',
  year = 1995,
  history = 'Origin: 1995 - A Nollie Hardflip 180 performed with a unique vertical rotation. Named after Campbell''s iconic style. | Creator: Kareem Campbell'
where name ilike '%Ghetto Bird%';

-- MUSKA FLIP
update public.tricks set 
  inventor = 'Chad Muska',
  year = 1998,
  history = 'Origin: 1998 - A stylish frontside 180 kickflip performed with the board flipped vertically through the legs. | Creator: Chad Muska'
where name ilike '%Muska Flip%';

-- SMITH GRIND
update public.tricks set 
  inventor = 'Mike Smith',
  year = 1982,
  history = 'Origin: 1982 - The back truck grinds while the front truck hangs below the obstacle. A foundational grind trick. | Creator: Mike Smith'
where name ilike '%Smith Grind%';

-- FEEBLE GRIND
update public.tricks set 
  inventor = 'Josh Nelson',
  year = 1986,
  history = 'Origin: 1986 - The back truck grinds while the front truck hangs over the far side of the rail or ledge. | Creator: Josh Nelson'
where name ilike '%Feeble Grind%';

-- CROOKED GRIND
update public.tricks set 
  inventor = 'Dan Peterka / Eric Koston',
  year = 1990,
  history = 'Origin: Early 1990s - A nosegrind where the board is angled outward. Popularized by Koston in the early 90s tech era. | Creator: Dan Peterka / Eric Koston'
where name ilike '%Crooked Grind%' or name ilike '%K-Grind%';

-- SALAD GRIND
update public.tricks set 
  inventor = 'Eric Dressen',
  year = 1990,
  history = 'Origin: 1990 - A 5-0 grind where the front of the board is angled toward the frontside. | Creator: Eric Dressen'
where name ilike '%Salad Grind%';

-- BOARDSLIDE / LIPSLIDE
update public.tricks set 
  inventor = 'Natas Kaupas / Mark Gonzales',
  year = 1985,
  history = 'Origin: Mid 1980s - Sliding the center of the board on a rail or ledge. Pioneered street rail skating. | Creator: Natas Kaupas / Mark Gonzales'
where name ilike '%Boardslide%' or name ilike '%Lipslide%';

-- TAILSLIDE
update public.tricks set 
  inventor = 'Ben Schroeder',
  year = 1987,
  history = 'Origin: 1987 - Sliding on the tail of the board. Originally called the "Chafe Slide." | Creator: Ben Schroeder'
where name ilike '%Tailslide%';

-- NOSESLIDE
update public.tricks set 
  inventor = 'Neil Blender',
  year = 1980,
  history = 'Origin: 1980s - Sliding on the nose of the board. Neil Blender pioneered many stall and slide variations. | Creator: Neil Blender'
where name ilike '%Noseslide%';

-- DARKSLIDE
update public.tricks set 
  inventor = 'Mark Gonzales / Rodney Mullen',
  year = 1991,
  history = 'Origin: 1991 (Gonzales) / 1993 (Mullen) - A trick where the skater slides on the grip tape (upside down board). | Creator: Mark Gonzales / Rodney Mullen'
where name ilike '%Darkslide%';

-- CASPER SLIDE
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1992,
  history = 'Origin: 1992 - A slide performed with the board upside down, balancing with one foot on the tail and one under. | Creator: Rodney Mullen'
where name ilike '%Casper Slide%';

-- PRIMO SLIDE
update public.tricks set 
  inventor = 'Rodney Mullen',
  year = 1992,
  history = 'Origin: 1992 - A slide performed on the side edge (rails) of the board. | Creator: Rodney Mullen'
where name ilike '%Primo Slide%';

-- NO COMPLY
update public.tricks set 
  inventor = 'Neil Blender',
  year = 1986,
  history = 'Origin: 1986 - Stepping off the front foot to pop the board. Popularized by Blender and early street innovators. | Creator: Neil Blender'
where name ilike '%No Comply%';

-- BONELESS
update public.tricks set 
  inventor = 'Garry Scott Davis (GSD)',
  year = 1980,
  history = 'Origin: Early 1980s - Grabbing the board and jumping while using one foot to push off the ground. | Creator: Garry Scott Davis'
where name ilike '%Boneless%';

-- MCTWIST
update public.tricks set 
  inventor = 'Mike McGill',
  year = 1984,
  history = 'Origin: 1984 - A 540-degree backside aerial spin with a mute grab. A landmark vert trick. | Creator: Mike McGill'
where name ilike '%McTwist%';

-- 900
update public.tricks set 
  inventor = 'Tony Hawk',
  year = 1999,
  history = 'Origin: 1999 - Two and a half full rotations in the air. First landed by Tony Hawk at the 1999 X Games. | Creator: Tony Hawk'
where name ilike '%900%';

-- INDY GRAB
update public.tricks set 
  inventor = 'Duane Peters',
  year = 1980,
  history = 'Origin: 1980 - A backside grab where the back hand holds the frontside edge. Originally called the "Indy Air." | Creator: Duane Peters'
where name ilike '%Indy Grab%';

-- CHRIST AIR
update public.tricks set 
  inventor = 'Christian Hosoi',
  year = 1980,
  history = 'Origin: 1980s - While airborne, the rider holds the board in one hand and spreads their arms like a crucifix. | Creator: Christian Hosoi'
where name ilike '%Christ Air%';

-- NATAS SPIN
update public.tricks set 
  inventor = 'Natas Kaupas',
  year = 1980,
  history = 'Origin: 1980s - Spinning 360 degrees or more on top of a pole or post. | Creator: Natas Kaupas'
where name ilike '%Natas Spin%';
