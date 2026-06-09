-- supabase/migrations/002_payments_rename_ref.sql
-- Rename flutterwave_ref -> payment_ref (provider-agnostic) as part of Pesapal migration

alter table land_payments rename column flutterwave_ref to payment_ref;
