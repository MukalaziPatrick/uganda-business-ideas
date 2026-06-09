-- Migration: widen verification_stage constraint to accept SafeLands real stages
-- verified   = full document + physical survey done
-- checked    = physically inspected but docs pending
-- self_listed = farmer self-submitted, no agent verification yet

alter table land_listings drop constraint if exists land_listings_verification_stage_check;
alter table land_listings add constraint land_listings_verification_stage_check
  check (verification_stage in ('unverified','submitted','in-review','verified','checked','self_listed'));
