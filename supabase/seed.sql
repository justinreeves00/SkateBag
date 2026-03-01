-- ============================================================
-- Skatebag — Database Schema & Seed
-- ============================================================

-- TRICKS TABLE
create table if not exists public.tricks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  history text,
  inventor text,
  year integer,
  youtube_query text,
  created_at timestamptz default now()
);

-- USER_TRICKS TABLE
create table if not exists public.user_tricks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  trick_id uuid references public.tricks(id) on delete cascade not null,
  status text check (status in ('landed', 'locked')) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, trick_id)
);

-- RLS
alter table public.tricks enable row level security;
alter table public.user_tricks enable row level security;

-- Tricks: anyone can read
create policy "Tricks are publicly readable"
  on public.tricks for select
  using (true);

-- User tricks: users manage their own
create policy "Users can view own tricks"
  on public.user_tricks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tricks"
  on public.user_tricks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tricks"
  on public.user_tricks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tricks"
  on public.user_tricks for delete
  using (auth.uid() = user_id);

-- ============================================================
-- SEED: TRICKS
-- ============================================================

insert into public.tricks (name, category, history, inventor, year, youtube_query) values

-- FLATGROUND BASICS
('Ollie', 'flatground', 'The foundation of modern street skating, invented by Alan "Ollie" Gelfand in 1978 on vert, then adapted for flat ground by Rodney Mullen in 1982.', 'Alan Gelfand', 1978, 'how to ollie skateboard tutorial'),
('Kickflip', 'flatground', 'One of the most iconic tricks in skateboarding. Rodney Mullen invented the flatground kickflip in 1983, transforming street skating forever.', 'Rodney Mullen', 1983, 'how to kickflip skateboard tutorial'),
('Heelflip', 'flatground', 'The counterpart to the kickflip, flipping the board with the heel. Invented by Rodney Mullen in the early 1980s.', 'Rodney Mullen', 1983, 'how to heelflip skateboard tutorial'),
('Pop Shove-it', 'flatground', 'A shove-it with pop, spinning the board 180 degrees backside without flipping. A foundational trick for beginners and pros alike.', 'Rodney Mullen', 1983, 'how to pop shove it skateboard tutorial'),
('Frontside Pop Shove-it', 'flatground', 'The frontside variation of the pop shove-it, spinning the board 180 degrees in the frontside direction.', null, null, 'how to frontside pop shove it skateboard tutorial'),
('Varial Kickflip', 'flatground', 'A kickflip combined with a backside pop shove-it. A staple combo trick in street skating.', 'Rodney Mullen', 1983, 'how to varial kickflip skateboard tutorial'),
('Varial Heelflip', 'flatground', 'A heelflip combined with a frontside pop shove-it. Popularized in the 1990s street scene.', null, null, 'how to varial heelflip skateboard tutorial'),
('Hardflip', 'flatground', 'A kickflip combined with a frontside pop shove-it. Known for its sharp, technical look.', 'Kris Markovich', 1991, 'how to hardflip skateboard tutorial'),
('Inward Heelflip', 'flatground', 'A heelflip combined with a backside pop shove-it. The flip and spin work against each other making it visually striking.', null, null, 'how to inward heelflip skateboard tutorial'),
('360 Flip', 'flatground', 'Also called a tre flip or 3 flip. A kickflip with a 360 backside pop shove-it. One of the most revered tricks in street skating.', 'Rodney Mullen', 1984, 'how to 360 flip tre flip skateboard tutorial'),
('360 Hardflip', 'flatground', 'A hardflip with a full 360 frontside body rotation. Extremely technical and rarely landed cleanly.', null, null, '360 hardflip skateboard tutorial'),
('Frontside 360 Flip', 'flatground', 'A kickflip combined with a 360 frontside pop shove-it. Also called a frontside tre or forward flip.', null, null, 'frontside 360 flip skateboard tutorial'),
('Laser Flip', 'flatground', 'A 360 frontside shove-it combined with a heelflip. One of the hardest flatground tricks.', null, null, 'how to laser flip skateboard tutorial'),
('Gazelle Flip', 'flatground', 'A 360 body varial with a 360 backside shove-it and a heelflip. Named for its smooth, spinning appearance.', 'Rodney Mullen', 1985, 'gazelle flip skateboard tutorial'),
('Caballerial', 'flatground', 'A fakie 360 ollie named after Steve Caballero who invented it on vert. Mullen adapted it to flat ground.', 'Steve Caballero', 1981, 'how to caballerial skateboard tutorial'),
('Fakie Kickflip', 'flatground', 'A kickflip performed while rolling fakie (backwards). Changes the timing and feel significantly.', null, null, 'how to fakie kickflip skateboard tutorial'),
('Fakie Heelflip', 'flatground', 'A heelflip performed while rolling fakie.', null, null, 'how to fakie heelflip skateboard tutorial'),
('Fakie 360 Flip', 'flatground', 'A 360 flip performed rolling fakie. One of the smoothest looking fakie tricks.', null, null, 'how to fakie 360 flip skateboard tutorial'),
('Nollie', 'flatground', 'An ollie performed off the nose of the board instead of the tail. Popularized in the 1990s street scene.', null, null, 'how to nollie skateboard tutorial'),
('Nollie Kickflip', 'flatground', 'A kickflip performed nollie. The flip direction is opposite to a regular kickflip.', null, null, 'how to nollie kickflip skateboard tutorial'),
('Nollie Heelflip', 'flatground', 'A heelflip performed nollie.', null, null, 'how to nollie heelflip skateboard tutorial'),
('Nollie 360 Flip', 'flatground', 'A 360 flip performed nollie. An extremely technical trick.', null, null, 'nollie 360 flip skateboard tutorial'),
('Nollie Hardflip', 'flatground', 'A hardflip performed nollie stance.', null, null, 'nollie hardflip skateboard tutorial'),
('Nollie Laser Flip', 'flatground', 'A laser flip performed nollie. One of the rarest tricks in skateboarding.', null, null, 'nollie laser flip skateboard'),
('Nollie Inward Heelflip', 'flatground', 'An inward heelflip performed nollie.', null, null, 'nollie inward heelflip skateboard'),
('Switch Ollie', 'flatground', 'An ollie performed in switch stance (opposite foot forward). Popularized as switch skating became mainstream in the 1990s.', null, null, 'how to switch ollie skateboard tutorial'),
('Switch Kickflip', 'flatground', 'A kickflip performed in switch stance. One of the most respected tricks in modern street skating.', null, null, 'how to switch kickflip skateboard tutorial'),
('Switch Heelflip', 'flatground', 'A heelflip in switch stance.', null, null, 'how to switch heelflip skateboard tutorial'),
('Switch 360 Flip', 'flatground', 'A 360 flip in switch stance. Considered one of the hardest flat ground tricks.', null, null, 'switch 360 flip skateboard tutorial'),
('Switch Hardflip', 'flatground', 'A hardflip in switch stance.', null, null, 'switch hardflip skateboard tutorial'),
('Switch Laser Flip', 'flatground', 'A laser flip in switch stance. Extremely rare.', null, null, 'switch laser flip skateboard'),
('Double Kickflip', 'flatground', 'A kickflip where the board rotates twice before the skater catches it.', null, null, 'how to double kickflip skateboard tutorial'),
('Double Heelflip', 'flatground', 'A heelflip with two full rotations.', null, null, 'how to double heelflip skateboard tutorial'),
('Hospital Flip', 'flatground', 'A half kickflip where the board is caught and flipped back, named for the careful motion.', null, null, 'how to hospital flip skateboard tutorial'),
('Primo Flip', 'flatground', 'An under-flip variation where the board lands primo (on its side) briefly before returning. A Rodney Mullen specialty.', 'Rodney Mullen', 1980, 'primo flip skateboard tutorial'),
('Pressure Flip', 'flatground', 'A flip trick performed by pressing down on the tail to initiate the flip without a full pop. Old school technique.', null, null, 'pressure flip skateboard tutorial'),
('Impossible', 'flatground', 'The board wraps around the back foot in a 360 degree rotation. Invented by Rodney Mullen.', 'Rodney Mullen', 1982, 'how to impossible skateboard tutorial'),
('Bigspin', 'flatground', 'A 360 backside body rotation with a 180 backside board rotation. The body spins twice as fast as the board.', null, null, 'how to bigspin skateboard tutorial'),
('Frontside Bigspin', 'flatground', 'A bigspin in the frontside direction.', null, null, 'how to frontside bigspin skateboard tutorial'),
('Bigflip', 'flatground', 'A bigspin combined with a kickflip. The board flips and spins 180 while the body rotates 360.', null, null, 'how to bigflip skateboard tutorial'),
('Frontside Bigflip', 'flatground', 'A frontside bigspin with a kickflip.', null, null, 'frontside bigflip skateboard tutorial'),
('Half Cab', 'flatground', 'A fakie 180 ollie, named after Steve Caballero. The half rotation of the full Caballerial.', 'Steve Caballero', 1982, 'how to half cab skateboard tutorial'),
('Frontside Half Cab', 'flatground', 'A fakie frontside 180 ollie.', null, null, 'frontside half cab skateboard tutorial'),
('Frontside 180', 'flatground', 'An ollie with a 180 degree frontside body and board rotation.', null, null, 'how to frontside 180 skateboard tutorial'),
('Backside 180', 'flatground', 'An ollie with a 180 degree backside body and board rotation.', null, null, 'how to backside 180 skateboard tutorial'),
('Frontside 360', 'flatground', 'A full 360 frontside body and board rotation.', null, null, 'how to frontside 360 skateboard tutorial'),
('Backside 360', 'flatground', 'A full 360 backside body and board rotation.', null, null, 'how to backside 360 skateboard tutorial'),

-- STREET TRICKS
('Noseslide', 'street', 'Sliding on the nose of the board along a ledge or rail. A fundamental street trick popularized in the late 1980s.', null, null, 'how to noseslide skateboard tutorial'),
('Tailslide', 'street', 'Sliding on the tail of the board along a ledge or rail.', null, null, 'how to tailslide skateboard tutorial'),
('5-0 Grind', 'street', 'Grinding on the back truck only. Named from the old Tracker truck catalog numbering system.', null, null, 'how to 5-0 grind skateboard tutorial'),
('50-50 Grind', 'street', 'Grinding on both trucks simultaneously. One of the first grinds ever performed and still a fundamental.', null, null, 'how to 50-50 grind skateboard tutorial'),
('Nosegrind', 'street', 'Grinding on the front truck only. The nose-focused counterpart to the 5-0.', null, null, 'how to nosegrind skateboard tutorial'),
('Smith Grind', 'street', 'Back truck grinds the surface while the nose dips below. Named after Mike Smith.', 'Mike Smith', 1981, 'how to smith grind skateboard tutorial'),
('Feeble Grind', 'street', 'Back truck grinds while the front truck hangs over the edge on the other side of the ledge or rail.', null, null, 'how to feeble grind skateboard tutorial'),
('Crooked Grind', 'street', 'A nosegrind where the board is angled so it slides crookedly. Also called K-grind.', null, null, 'how to crooked grind skateboard tutorial'),
('Salad Grind', 'street', 'A 5-0 grind where the front truck hangs over the opposite side of the obstacle.', null, null, 'how to salad grind skateboard tutorial'),
('Willy Grind', 'street', 'A nosegrind where the tail hangs below the obstacle, opposite of the salad grind concept.', null, null, 'willy grind skateboard tutorial'),
('Bluntslide', 'street', 'Sliding with the tail pressed against the surface beyond the edge of the obstacle.', null, null, 'how to bluntslide skateboard tutorial'),
('Nosebluntslide', 'street', 'A bluntslide variation using the nose instead of the tail.', null, null, 'how to nosebluntslide skateboard tutorial'),
('Overcrook', 'street', 'A crooked grind variation where the front truck hangs over the far side.', null, null, 'how to overcrooks grind skateboard tutorial'),
('Lipslide', 'street', 'The board slides past the obstacle, locking in with the middle of the board on top.', null, null, 'how to lipslide skateboard tutorial'),
('Boardslide', 'street', 'The middle of the board slides along the obstacle perpendicular to direction of travel.', null, null, 'how to boardslide skateboard tutorial'),
('Noseblunt', 'street', 'A bluntslide on the nose, pressing the nose against the far side of the obstacle.', null, null, 'how to noseblunt skateboard tutorial'),
('Nosestall', 'street', 'Stalling with the nose pressed on top of an obstacle.', null, null, 'how to nosestall skateboard tutorial'),
('Tailstall', 'street', 'Stalling with the tail pressed on top of an obstacle.', null, null, 'tailstall skateboard tutorial'),
('Manual', 'street', 'Balancing on the back two wheels while rolling. A form of skateboard trick requiring balance and control.', null, null, 'how to manual skateboard tutorial'),
('Nose Manual', 'street', 'Balancing on the front two wheels while rolling.', null, null, 'how to nose manual skateboard tutorial'),
('Casper', 'street', 'The board is balanced upside down on the foot while performing a trick. A Rodney Mullen specialty.', 'Rodney Mullen', 1979, 'casper flip skateboard tutorial'),
('Darkslide', 'street', 'A boardslide performed with the board upside down. Considered one of the most technical slides.', 'Rodney Mullen', 1995, 'darkslide skateboard tutorial'),
('Kickflip Noseslide', 'street', 'A kickflip into a noseslide. A combo demonstrating control of both flip tricks and grinds.', null, null, 'kickflip noseslide skateboard tutorial'),
('Kickflip Boardslide', 'street', 'A kickflip into a boardslide.', null, null, 'kickflip boardslide skateboard tutorial'),
('Kickflip 50-50', 'street', 'A kickflip into a 50-50 grind.', null, null, 'kickflip 50-50 grind skateboard tutorial'),
('Heelflip Noseslide', 'street', 'A heelflip into a noseslide.', null, null, 'heelflip noseslide skateboard tutorial'),
('360 Flip Noseslide', 'street', 'A 360 flip into a noseslide. High level street trick.', null, null, '360 flip noseslide skateboard tutorial'),
('Nollie Noseslide', 'street', 'A noseslide entered nollie style.', null, null, 'nollie noseslide skateboard tutorial'),
('Switch Noseslide', 'street', 'A noseslide performed switch.', null, null, 'switch noseslide skateboard tutorial'),

-- RAILS
('Frontside Nosegrind', 'rails', 'A nosegrind approached frontside on a handrail or ledge.', null, null, 'frontside nosegrind rail skateboard tutorial'),
('Backside Nosegrind', 'rails', 'A nosegrind approached backside on a handrail or ledge.', null, null, 'backside nosegrind rail skateboard tutorial'),
('Frontside 50-50', 'rails', 'A 50-50 grind on a rail approached frontside.', null, null, 'frontside 50-50 rail grind skateboard tutorial'),
('Backside 50-50', 'rails', 'A 50-50 grind on a rail approached backside.', null, null, 'backside 50-50 rail grind skateboard tutorial'),
('Frontside Smith', 'rails', 'A smith grind on a rail approached frontside.', null, null, 'frontside smith grind rail skateboard tutorial'),
('Backside Smith', 'rails', 'A smith grind on a rail approached backside.', null, null, 'backside smith grind rail skateboard tutorial'),
('Frontside Feeble', 'rails', 'A feeble grind on a rail approached frontside.', null, null, 'frontside feeble grind rail skateboard tutorial'),
('Backside Feeble', 'rails', 'A feeble grind on a rail approached backside.', null, null, 'backside feeble grind rail skateboard tutorial'),
('Frontside Boardslide', 'rails', 'A boardslide on a rail approached frontside.', null, null, 'frontside boardslide rail skateboard tutorial'),
('Backside Boardslide', 'rails', 'A boardslide on a rail approached backside.', null, null, 'backside boardslide rail skateboard tutorial'),
('Frontside Lipslide', 'rails', 'A lipslide on a rail approached frontside.', null, null, 'frontside lipslide rail skateboard tutorial'),
('Backside Lipslide', 'rails', 'A lipslide on a rail approached backside.', null, null, 'backside lipslide rail skateboard tutorial'),
('Blunt to Fakie', 'rails', 'A bluntslide that exits rolling fakie out.', null, null, 'blunt to fakie skateboard tutorial'),
('Kickflip Crooked Grind', 'rails', 'A kickflip into a crooked grind on a rail.', null, null, 'kickflip crooked grind rail skateboard tutorial'),
('Tre Flip Boardslide', 'rails', 'A 360 flip into a boardslide on a rail. High level street rail trick.', null, null, 'tre flip boardslide rail skateboard'),

-- LEDGES
('Frontside Tailslide', 'ledges', 'A tailslide approached and exited frontside on a ledge.', null, null, 'frontside tailslide ledge skateboard tutorial'),
('Backside Tailslide', 'ledges', 'A tailslide approached and exited backside on a ledge.', null, null, 'backside tailslide ledge skateboard tutorial'),
('Frontside Noseslide', 'ledges', 'A noseslide approached frontside on a ledge.', null, null, 'frontside noseslide ledge skateboard tutorial'),
('Backside Noseslide', 'ledges', 'A noseslide approached backside on a ledge.', null, null, 'backside noseslide ledge skateboard tutorial'),
('Switch Tailslide', 'ledges', 'A tailslide performed in switch stance.', null, null, 'switch tailslide ledge skateboard tutorial'),
('Switch Bluntslide', 'ledges', 'A bluntslide performed in switch.', null, null, 'switch bluntslide ledge skateboard tutorial'),
('Nollie Bluntslide', 'ledges', 'A bluntslide entered nollie.', null, null, 'nollie bluntslide ledge skateboard tutorial'),
('Frontside Crooked Grind', 'ledges', 'A crooked grind approached frontside on a ledge.', null, null, 'frontside crooked grind ledge skateboard tutorial'),
('Backside Crooked Grind', 'ledges', 'A crooked grind approached backside on a ledge.', null, null, 'backside crooked grind ledge skateboard tutorial'),
('Nollie Nosegrind', 'ledges', 'A nosegrind entered nollie on a ledge.', null, null, 'nollie nosegrind ledge skateboard tutorial'),
('Fakie Nosegrind', 'ledges', 'A nosegrind entered fakie on a ledge.', null, null, 'fakie nosegrind ledge skateboard tutorial'),

-- GAPS / AIR
('Kickflip Gap', 'gaps', 'A kickflip performed over a gap. Tests both flip trick ability and ollie height.', null, null, 'kickflip gap skateboard'),
('Heelflip Gap', 'gaps', 'A heelflip over a gap.', null, null, 'heelflip gap skateboard'),
('360 Flip Gap', 'gaps', 'A 360 flip over a gap. A classic street gap trick.', null, null, 'tre flip gap skateboard'),
('Backside 180 Gap', 'gaps', 'A backside 180 ollie over a gap.', null, null, 'backside 180 gap skateboard'),
('Frontside 180 Gap', 'gaps', 'A frontside 180 ollie over a gap.', null, null, 'frontside 180 gap skateboard'),
('Frontside 360 Gap', 'gaps', 'A frontside 360 over a gap.', null, null, 'frontside 360 gap skateboard'),
('Nollie Flip Gap', 'gaps', 'A nollie kickflip over a gap.', null, null, 'nollie flip gap skateboard'),
('Switch 360 Flip Gap', 'gaps', 'A switch 360 flip over a gap. Highly technical.', null, null, 'switch 360 flip gap skateboard'),
('Laser Flip Gap', 'gaps', 'A laser flip over a gap. One of the most technical gap tricks.', null, null, 'laser flip gap skateboard'),
('Nollie Heelflip Gap', 'gaps', 'A nollie heelflip over a gap.', null, null, 'nollie heelflip gap skateboard'),

-- VERT / TRANSITION
('Axle Stall', 'vert', 'Both trucks stall on the coping of a ramp or pool. A foundational vert trick.', null, null, 'how to axle stall skateboard tutorial'),
('Rock to Fakie', 'vert', 'The board rocks over the coping and returns fakie. One of the first vert tricks learned.', null, null, 'how to rock to fakie skateboard tutorial'),
('Rock and Roll', 'vert', 'Similar to rock to fakie but the skater rotates frontside before returning down.', null, null, 'how to rock and roll skateboard tutorial'),
('Boardslide (Vert)', 'vert', 'A boardslide performed on the coping of a vert ramp.', null, null, 'boardslide vert skateboard coping tutorial'),
('Blunt (Vert)', 'vert', 'The tail stalls on the coping while the board is perpendicular to the ramp.', null, null, 'blunt stall vert skateboard coping tutorial'),
('Nose Blunt (Vert)', 'vert', 'The nose stalls on the coping while the board is perpendicular to the ramp.', null, null, 'nose blunt stall vert skateboard tutorial'),
('Invert', 'vert', 'A one-handed handstand on the coping while inverted. A classic vert pool trick.', null, null, 'invert skateboard vert tutorial'),
('Egg Plant', 'vert', 'A one-handed invert variation where the back hand grabs the board.', 'Eddie Elguera', 1977, 'eggplant skateboard vert tutorial'),
('McTwist', 'vert', 'A 540 degree mute grab rotation invented by Mike McGill in 1984. One of skating''s most iconic tricks.', 'Mike McGill', 1984, 'mctwist skateboard vert tutorial'),
('900', 'vert', 'Two and a half full rotations (900 degrees). Tony Hawk landed the first ever 900 at the 1999 X Games Best Trick.', 'Tony Hawk', 1999, 'tony hawk 900 skateboard'),
('720', 'vert', 'Two full rotations (720 degrees) in the air on vert. Considered extremely difficult.', null, null, '720 skateboard vert trick'),
('540', 'vert', 'One and a half rotations (540 degrees) on vert.', null, null, 'how to 540 skateboard vert tutorial'),
('360 (Vert)', 'vert', 'A full 360 degree rotation on vert.', null, null, 'how to 360 vert skateboard tutorial'),
('Alley Oop', 'vert', 'Any trick performed in the opposite rotation direction to what is natural for the approach.', null, null, 'alley oop skateboard vert tutorial'),
('Kickflip (Vert)', 'vert', 'A kickflip performed on vert, requiring significant height to flip and land.', null, null, 'kickflip vert skateboard tutorial'),
('Cab (Vert)', 'vert', 'A fakie 360 ollie on vert, named after Steve Caballero who invented it.', 'Steve Caballero', 1981, 'cab 360 vert skateboard tutorial'),
('Frontside Air', 'vert', 'A basic frontside grab performed above the coping on vert or in a bowl.', null, null, 'frontside air skateboard vert tutorial'),
('Backside Air', 'vert', 'A basic backside grab performed above the coping.', null, null, 'backside air skateboard vert tutorial'),
('Stalefish', 'vert', 'A grab where the back hand reaches behind the back leg to grab the heel edge.', null, null, 'how to stalefish grab skateboard tutorial'),
('Mute Grab', 'vert', 'The front hand grabs the toe edge between the feet. A classic air grab.', 'Chris Weddle', 1983, 'how to mute grab skateboard tutorial'),
('Melon Grab', 'vert', 'The front hand grabs the heel edge between the feet.', 'Neil Blender', 1983, 'how to melon grab skateboard tutorial'),
('Indy Grab', 'vert', 'The back hand grabs the toe edge between the trucks. Named after Independent Trucks.', null, null, 'how to indy grab skateboard tutorial'),
('Nosegrab', 'vert', 'Grabbing the nose of the board during an air.', null, null, 'how to nosegrab skateboard tutorial'),
('Tailgrab', 'vert', 'Grabbing the tail of the board during an air.', null, null, 'how to tailgrab skateboard tutorial'),
('Lien Air', 'vert', 'The front hand grabs the heel edge between the trucks. Named after Neil (Lien spelled backwards).', 'Neil Blender', 1983, 'lien air skateboard vert tutorial'),
('Japan Air', 'vert', 'Front hand grabs the toe edge between the feet while the front knee is pulled up.', null, null, 'japan air skateboard vert tutorial'),
('Benihana', 'vert', 'The back foot kicks off the board while the hand grabs the nose. Named by Lester Kasai.', 'Lester Kasai', 1985, 'benihana skateboard trick tutorial'),
('Madonna', 'vert', 'The back foot kicks off the board while grabbing mute. Named by Tony Hawk.', 'Tony Hawk', 1986, 'madonna skateboard trick tutorial'),
('Airwalk', 'vert', 'Both feet come off the board during an air while the board is grabbed. Named by Tony Hawk.', 'Tony Hawk', 1983, 'airwalk skateboard trick tutorial'),

-- BOWL / POOL
('Frontside Grind (Bowl)', 'bowl', 'A frontside 50-50 grind on the coping of a bowl or pool.', null, null, 'frontside grind bowl pool skateboard tutorial'),
('Backside Grind (Bowl)', 'bowl', 'A backside 50-50 grind on the coping of a bowl or pool.', null, null, 'backside grind bowl pool skateboard tutorial'),
('Carve', 'bowl', 'A flowing curved turn on the walls of a bowl or pool, using the trucks to carve into the transition.', null, null, 'how to carve bowl skateboard tutorial'),
('Kickturn', 'bowl', 'Pivoting on the back trucks to change direction on a ramp or bowl wall.', null, null, 'how to kickturn ramp skateboard tutorial'),
('Frontside Kickturn', 'bowl', 'A kickturn in the frontside direction on a ramp or bowl.', null, null, 'frontside kickturn ramp skateboard tutorial'),
('Drop In', 'bowl', 'Starting at the top of a ramp or bowl wall and dropping in to roll down. The first skill needed for vert and bowl.', null, null, 'how to drop in skateboard ramp tutorial'),
('Fly Out', 'bowl', 'Flying out of a bowl over the coping to land on flat or on top.', null, null, 'fly out bowl skateboard tutorial'),
('Pool Coping Slide', 'bowl', 'A slide on the ceramic or pool coping of a backyard pool.', null, null, 'pool coping slide skateboard tutorial'),

-- FREESTYLE / TECH
('Flatground Heelflip', 'freestyle', 'A heelflip performed on flat ground. Rodney Mullen invented this as part of his revolutionary freestyle repertoire.', 'Rodney Mullen', 1983, 'how to heelflip flat ground skateboard tutorial'),
('G-Turn', 'freestyle', 'A spinning body varial on flat ground, an old school freestyle move.', null, null, 'g-turn freestyle skateboard'),
('Rail Stand', 'freestyle', 'Balancing the skateboard on its side (rail) with one foot. Popularized by Rodney Mullen.', 'Rodney Mullen', 1980, 'rail stand skateboard freestyle tutorial'),
('Pogo', 'freestyle', 'Bouncing the skateboard on its tail with one foot on the board and one on the nose, like a pogo stick.', 'Rodney Mullen', 1982, 'pogo skateboard freestyle trick'),
('Fingerflip', 'freestyle', 'Using the fingers to flip the board during a trick. A classic freestyle and street move.', null, null, 'fingerflip skateboard tutorial'),
('No Comply', 'freestyle', 'The front foot steps off, the tail pops, and the board does various rotations. Named for not complying with standard ollie mechanics.', null, null, 'how to no comply skateboard tutorial'),
('No Comply 360', 'freestyle', 'A no comply with a full 360 rotation of the board.', null, null, 'no comply 360 skateboard tutorial'),
('No Comply Shove-it', 'freestyle', 'A no comply with a shove-it board rotation.', null, null, 'no comply shove it skateboard tutorial'),
('Body Varial', 'freestyle', 'The skater jumps and rotates 180 degrees while the board stays still.', null, null, 'how to body varial skateboard tutorial'),
('360 Body Varial', 'freestyle', 'A full 360 body spin while the board stays on the ground or in the air.', null, null, '360 body varial skateboard tutorial'),

-- DOWNHILL / SLIDES
('Coleman Slide', 'downhill', 'A heelside pendulum slide used for speed control in downhill skateboarding. Named after Cliff Coleman.', 'Cliff Coleman', 1975, 'coleman slide longboard downhill tutorial'),
('Toeside Slide', 'downhill', 'A toeside sliding motion used to control speed on downhill runs.', null, null, 'toeside slide longboard downhill tutorial'),
('Standies', 'downhill', 'Standing slides used for speed checks while maintaining an upright position.', null, null, 'standies downhill longboard tutorial'),

-- MISC / SIGNATURE
('Del Mar Invert', 'vert', 'An invert variation where the hand plants on the coping while the board is grabbed. Associated with Del Mar Skate Ranch.', null, null, 'del mar invert skateboard'),
('Ho-Ho Plant', 'vert', 'A handstand plant on the coping using both hands, often with a stunt ending.', null, null, 'ho-ho plant skateboard vert trick'),
('Bertlemann Slide', 'street', 'A carving, low slide named after Larry Bertlemann''s surfing-influenced style.', 'Larry Bertlemann', 1975, 'bertlemann slide skateboard'),
('Gorilla Grip', 'street', 'Grabbing the board with the toes curled over the deck edge.', null, null, 'gorilla grip skateboard trick'),
('One Foot Ollie', 'flatground', 'An ollie where one foot extends off the board while in the air.', null, null, 'one foot ollie skateboard tutorial'),
('Fingerflip Airwalk', 'vert', 'Combining a fingerflip with an airwalk motion.', null, null, 'fingerflip airwalk skateboard trick'),
('Nightmare Flip', 'flatground', 'A 360 hardflip combined with a varial motion, making it appear as a double flip. Extremely rare.', null, null, 'nightmare flip skateboard trick'),
('Ghetto Bird', 'flatground', 'A switch hardflip. Named and popularized by Eric Koston.', 'Eric Koston', 1997, 'ghetto bird skateboard trick tutorial'),
('Nerd Flip', 'flatground', 'A 360 flip to fakie. Nicknamed ''nerd flip'' in street skating slang.', null, null, 'nerd flip skateboard trick'),
('Darkflip', 'flatground', 'A varial heelflip combined with a darkside motion.', null, null, 'darkflip skateboard trick'),
('Crook to Fakie', 'ledges', 'A crooked grind that exits rolling fakie.', null, null, 'crooked grind to fakie skateboard tutorial'),
('Nose Manual Kickflip Out', 'street', 'A nose manual exited with a kickflip.', null, null, 'nose manual kickflip out skateboard tutorial'),
('Manual Kickflip Out', 'street', 'A manual exited with a kickflip.', null, null, 'manual kickflip out skateboard tutorial'),
('Manual 360 Flip Out', 'street', 'A manual exited with a 360 flip.', null, null, 'manual 360 flip out skateboard tutorial');
