-- Consolidate categories
update public.tricks set category = 'ledge/rail' where category in ('ledges', 'rails');
update public.tricks set category = 'transition' where category in ('vert', 'bowl');
