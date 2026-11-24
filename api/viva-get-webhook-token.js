import { getSupabaseAdmin, getVivaSettings, vivaUrls } from './_lib/viva.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let merchantId = req.body?.merchant_id;
  let apiKey = req.body?.api_key;
  let environment = req.body?.environment || 'demo';

  let supabase = null;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.warn('Supabase admin not available:', err.message);
  }

  // If not provided in body, try reading from Supabase
  if ((!merchantId || !apiKey) && supabase) {
    try {
      const settings = await getVivaSettings(supabase);
      merchantId = settings.merchant_id;
      apiKey = settings.api_key;
      environment = settings.environment || environment;
    } catch (err) {
      // Continue and report missing credentials below
    }
  }

  if (!merchantId || !apiKey) {
    return res.status(400).json({
      success: false,
      error: 'Απαιτούνται Merchant ID και API Key για να ζητηθεί το Webhook Key από τη Viva.',
    });
  }

  try {
    const { web } = vivaUrls(environment);
    const basic = Buffer.from(`${merchantId.trim()}:${apiKey.trim()}`).toString('base64');

    const keyRes = await fetch(`${web}/api/messages/config/token`, {
      method: 'GET',
      headers: { Authorization: `Basic ${basic}` },
    });

    if (!keyRes.ok) {
      const errText = await keyRes.text();
      return res.status(keyRes.status).json({
        success: false,
        error: `Η Viva απέρριψε το αίτημα (HTTP ${keyRes.status}). Ελέγξτε αν το Merchant ID & API Key ανήκουν σε ${environment.toUpperCase()} περιβάλλον. Λεπτομέρειες: ${errText.slice(0, 200)}`,
      });
    }

    const data = await keyRes.json();
    const webhookKey = data.Key;

    if (!webhookKey) {
      return res.status(502).json({
        success: false,
        error: 'Η Viva δεν επέστρεψε πεδίο Key.',
      });
    }

    // Auto-save to Supabase if possible
    if (supabase) {
      try {
        await supabase
          .from('payment_settings')
          .update({ webhook_key: webhookKey })
          .eq('provider', 'viva');
      } catch (saveErr) {
        console.warn('Could not auto-save webhook key to Supabase:', saveErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      key: webhookKey,
      message: 'Το Webhook Key ανακτήθηκε επιτυχώς από τη Viva!',
    });
  } catch (err) {
    console.error('get-webhook-token error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Σφάλμα επικοινωνίας με τη Viva.',
    });
  }
}
