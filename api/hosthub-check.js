import { HOSTHUB_RENTALS, checkHosthubAvailability } from './_lib/hosthub.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { apartmentId, hosthubId, startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  let targetId = hosthubId;
  if (!targetId && apartmentId) {
    const found = HOSTHUB_RENTALS.find((r) => r.id === apartmentId || r.hosthub_id === apartmentId);
    targetId = found?.hosthub_id;
  }

  if (!targetId) {
    return res.status(200).json({ available: true });
  }

  try {
    const isAvailable = await checkHosthubAvailability(targetId, startDate, endDate);
    return res.status(200).json({
      available: isAvailable,
      hosthub_id: targetId,
      source: 'Hosthub Live Sync',
    });
  } catch (err) {
    console.error('hosthub-check error:', err);
    return res.status(200).json({ available: true, error: err.message });
  }
}
