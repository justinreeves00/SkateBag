-- Add difficulty to tricks table
alter table public.tricks add column if not exists difficulty integer check (difficulty between 1 and 5);

-- Initial difficulty mapping (1: Beginner, 2: Novice, 3: Intermediate, 4: Advanced, 5: Expert)

-- 1: Basic foundations
update public.tricks set difficulty = 1 where name in ('Ollie', 'Nollie', 'Fakie Ollie', 'Switch Ollie', 'Frontside 180', 'Backside 180', 'Pop Shove-it', 'Frontside Pop Shove-it', 'Axle Stall', 'Nosestall', 'Tailstall', 'Revert');

-- 2: Core flips and basic grinds
update public.tricks set difficulty = 2 where name in ('Kickflip', 'Heelflip', 'Fakie Kickflip', 'Fakie Heelflip', 'Nollie Kickflip', 'Nollie Heelflip', 'Varial Kickflip', 'Varial Heelflip', 'Half Cab', '50-50 Grind', 'Boardslide', 'Frontside Boardslide', 'Backside Boardslide', 'Noseslide', 'Frontside Noseslide', 'Backside Noseslide', 'Shoveit Revert');

-- 3: Advanced flips and technical grinds
update public.tricks set difficulty = 3 where name in ('360 Flip', 'Hardflip', 'Inward Heelflip', 'Big Spin', 'Frontside Big Spin', 'Impossible', 'Ghetto Bird', '5-0 Grind', 'Nosegrind', 'Smith Grind', 'Feeble Grind', 'Crooked Grind', 'Tailslide', 'Lipslide', 'Heelflip Boardslide', 'Kickflip 50-50', 'Fakie 360 Flip');

-- 4: Highly technical and risky tricks
update public.tricks set difficulty = 4 where name in ('Laser Flip', '360 Hardflip', 'Double Kickflip', 'Double Heelflip', 'Gazelle Spin', 'Gazelle Flip', 'Nose blunt Grind', 'Blunt Grind', 'Noseblunt Slide', 'Blunt Slide', 'Darkslide', 'Caballerial', 'Switch 360 Flip', 'Switch Hardflip', 'Nollie 360 Flip', 'Dolphin Flip');

-- 5: Elite level
update public.tricks set difficulty = 5 where name in ('540 Flip', 'Triple Kickflip', 'Triple Heelflip', 'Bigspin Kickflip', '360 Inward Heelflip', 'Gazelle Grind', '900', 'McTwist');

-- Default remaining to 3
update public.tricks set difficulty = 3 where difficulty is null;
