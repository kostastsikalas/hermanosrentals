-- Create table for payment provider settings (Viva.com)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  provider TEXT PRIMARY KEY,
  environment TEXT NOT NULL DEFAULT 'demo' CHECK (environment IN ('demo', 'live')),
  merchant_id TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  client_id TEXT NOT NULL DEFAULT '',
  client_secret TEXT NOT NULL DEFAULT '',
  source_code TEXT NOT NULL DEFAULT '',
  webhook_key TEXT NOT NULL DEFAULT '',
  is_connected BOOLEAN NOT NULL DEFAULT FALSE,
  connected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Note: Adjust these policies if you add Supabase Auth for the admin panel.
-- Currently matches the open admin pattern used by scooters/apartments/bookings in this project.
DROP POLICY IF EXISTS "Allow read payment_settings" ON public.payment_settings;
CREATE POLICY "Allow read payment_settings"
  ON public.payment_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow upsert payment_settings" ON public.payment_settings;
CREATE POLICY "Allow upsert payment_settings"
  ON public.payment_settings
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update payment_settings" ON public.payment_settings;
CREATE POLICY "Allow update payment_settings"
  ON public.payment_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
