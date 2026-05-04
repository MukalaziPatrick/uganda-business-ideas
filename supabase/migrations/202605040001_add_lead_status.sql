alter table public.leads
add column if not exists status text default 'new';

update public.leads
set status = 'new'
where status is null;

alter table public.leads
alter column status set default 'new',
alter column status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_status_check'
      and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads
    add constraint leads_status_check
    check (status in ('new', 'contacted', 'qualified', 'not_fit', 'closed'));
  end if;
end;
$$;

create index if not exists leads_status_idx on public.leads(status);
