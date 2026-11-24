import { getSupabaseAdmin, getVivaSettings, confirmBookingFromTransaction, vivaUrls } from './_lib/viva.js';

// Viva webhook endpoint: https://YOUR-DOMAIN/api/viva-webhook
//  - GET  : Viva verifies the URL; we must return { Key } matching the account's webhook token.
//  - POST : events (1796 = Transaction Payment Created, 1798 = Transaction Failed).
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- 1. VERIFICATION HANDSHAKE (GET) ---
  if (req.method === 'GET') {
    // 1a. If a key is passed via query param (e.g. /api/viva-webhook?key=XYZ) or environment variable
    const directKey = req.query?.key || process.env.VIVA_WEBHOOK_KEY;
    if (directKey) {
      return res.status(200).json({ Key: String(directKey).trim() });
    }

    try {
      const supabase = getSupabaseAdmin();
      const settings = await getVivaSettings(supabase);

      // 1b. If the admin already saved the webhook key in the dashboard
      if (settings.webhook_key && settings.webhook_key.trim().length > 0) {
        return res.status(200).json({ Key: settings.webhook_key.trim() });
      }

      // 1c. Otherwise, auto-fetch the key from Viva's API using Merchant ID + API Key
      if (!settings.merchant_id || !settings.api_key) {
        return res.status(400).json({
          error: 'Merchant ID and API Key are required to fetch the webhook token automatically.',
        });
      }

      const { web } = vivaUrls(settings.environment);
      const basic = Buffer.from(`${settings.merchant_id.trim()}:${settings.api_key.trim()}`).toString('base64');
      const keyRes = await fetch(`${web}/api/messages/config/token`, {
        headers: { Authorization: `Basic ${basic}` },
      });

      if (!keyRes.ok) {
        const errText = await keyRes.text();
        return res.status(502).json({
          error: `Could not fetch token from Viva (HTTP ${keyRes.status}): ${errText.slice(0, 200)}`,
        });
      }

      const data = await keyRes.json();
      return res.status(200).json({ Key: data.Key });
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

      // Always return 200 OK so Viva knows the event was received
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error('viva-webhook POST error:', err);
      // Return 200 to prevent infinite retry storms if data was malformed, but log error
      return res.status(200).json({ received: true, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
