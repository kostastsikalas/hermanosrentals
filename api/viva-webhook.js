import { getSupabaseAdmin, getVivaSettings, confirmBookingFromTransaction, vivaUrls } from './_lib/viva.js';

// Viva webhook endpoint: https://YOUR-DOMAIN/api/viva-webhook
//  - GET  : Viva verifies the URL; we must return { Key } obtained from Viva.
//  - POST : events (1796 = Transaction Payment Created, 1798 = Transaction Failed).
// The payload is never trusted: the transaction is re-fetched from Viva.
export default async function handler(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const settings = await getVivaSettings(supabase);

    if (req.method === 'GET') {
      if (!settings.merchant_id || !settings.api_key) {
        return res.status(500).json({ error: 'Merchant ID / API Key missing in admin settings.' });
      }
      const { web } = vivaUrls(settings.environment);
      const basic = Buffer.from(`${settings.merchant_id}:${settings.api_key}`).toString('base64');
      const keyRes = await fetch(`${web}/api/messages/config/token`, {
        headers: { Authorization: `Basic ${basic}` },
      });
      if (!keyRes.ok) {
        return res.status(500).json({ error: `Could not get webhook key (HTTP ${keyRes.status}).` });
      }
      const data = await keyRes.json();
      return res.status(200).json({ Key: data.Key });
    }

    if (req.method === 'POST') {
      const event = req.body || {};
      const transactionId = event?.EventData?.TransactionId;
      if (transactionId) {
        await confirmBookingFromTransaction(supabase, settings, transactionId);
      }
      // Always 200 so Viva does not keep retrying for events we ignore
      return res.status(200).json({ received: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('viva-webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
