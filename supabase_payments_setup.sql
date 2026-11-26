-- Payment fields for bookings (Viva Smart Checkout)
-- Run this once in Supabase → SQL Editor.

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS apartment_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS scooter_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_option TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refundable BOOLEAN;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS amount_total NUMERIC(10,2);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS amount_due_now NUMERIC(10,2);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS amount_discount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2) DEFAULT 0;
-- pending | deposit_paid | paid | failed | refunded
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS viva_order_code TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS viva_transaction_id TEXT;

CREATE INDEX IF NOT EXISTS bookings_viva_order_code_idx ON public.bookings (viva_order_code);
