import { getSupabaseAdmin, getVivaSettings, confirmBookingFromTransaction, vivaUrls } from './_lib/viva.js';

// Viva webhook endpoint: https://YOUR-DOMAIN/api/viva-webhook
//  - GET  : Viva verifies the URL by expecting: {"Key": "..."}
//  - POST : Viva sends transaction event notifications.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- 1. VERIFICATION HANDSHAKE (GET) ---
  if (req.method === 'GET') {
    // 1a. Direct query param or ENV
    const directKey = req.query?.key || process.env.VIVA_WEBHOOK_KEY;
    if (directKey) {
      return res.status(200).json({ Key: String(directKey).trim() });
    }

    try {
      const supabase = getSupabaseAdmin();
      let settings = null;

      try {
        settings = await getVivaSettings(supabase);
      } catch (settingsErr) {
        console.warn('Could not read Viva settings:', settingsErr.message);
      }

      // 1b. If webhook_key is already saved
      if (settings?.webhook_key && settings.webhook_key.trim().length > 0) {
        return res.status(200).json({ Key: settings.webhook_key.trim() });
      }

      // 1c. If credentials exist, fetch from Viva
      if (settings?.merchant_id && settings?.api_key) {
        const { web } = vivaUrls(settings.environment);
        const basic = Buffer.from(`${settings.merchant_id.trim()}:${settings.api_key.trim()}`).toString('base64');
        const keyRes = await fetch(`${web}/api/messages/config/token`, {
          headers: { Authorization: `Basic ${basic}` },
        });

        if (keyRes.ok) {
          const data = await keyRes.json();
          if (data?.Key) {
            // Auto-cache back to Supabase
            try {
              await supabase
                .from('payment_settings')
                .update({ webhook_key: data.Key })
                .eq('provider', 'viva');
            } catch (cacheErr) {
              // Ignore cache error
            }
            return res.status(200).json({ Key: data.Key });
          }
        }
      }

      // If we don't have the key yet, return a helpful response
      return res.status(400).json({
        error: 'Webhook verification key not configured yet. Go to /admin -> Viva Payments and click "Ανάκτηση Webhook Key".',
      });
    } catch (err) {
      console.error('viva-webhook GET error:', err);
      return res.status(500).json({ error: err.message || 'Webhook verification error' });
    }
  }

  // --- 2. EVENT NOTIFICATIONS (POST) ---
  if (req.method === 'POST') {
    try {
      const supabase = getSupabaseAdmin();
      const settings = await getVivaSettings(supabase);

      const event = req.body || {};
      const transactionId = event?.EventData?.TransactionId;

      if (transactionId) {
        await confirmBookingFromTransaction(supabase, settings, transactionId);
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      console.error('viva-webhook POST error:', err);
      return res.status(200).json({ received: true, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
