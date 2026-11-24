import { getSupabaseAdmin, getVivaSettings, confirmBookingFromTransaction } from './_lib/viva.js';

// Called by the success page with the transaction id Viva put in the URL (?t=...).
// The transaction is verified directly with Viva before the booking is updated.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { transactionId } = req.body || {};
  if (!transactionId) return res.status(400).json({ error: 'transactionId is required' });

  try {
    const supabase = getSupabaseAdmin();
    const settings = await getVivaSettings(supabase);
    const result = await confirmBookingFromTransaction(supabase, settings, transactionId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('viva-confirm error:', err);
    return res.status(500).json({ error: err.message });
  }
}
