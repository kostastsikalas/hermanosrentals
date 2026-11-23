export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' });
  }

  const { client_id, client_secret, environment } = req.body || {};

  if (!client_id || !client_secret) {
    return res.status(400).json({
      valid: false,
      error: 'Απαιτούνται Client ID και Client Secret για επαλήθευση.',
    });
  }

  const tokenUrl =
    environment === 'live'
      ? 'https://accounts.vivapayments.com/connect/token'
      : 'https://demo-accounts.vivapayments.com/connect/token';

  try {
    const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      return res.status(401).json({
        valid: false,
        error: `Η Viva απέρριψε τα στοιχεία (HTTP ${response.status}). Ελέγξτε Client ID, Client Secret και αν επιλέξατε Demo ή Live.`,
      });
    }

    const data = await response.json();
    if (data && data.access_token) {
      return res.status(200).json({
        valid: true,
        message: 'Επιτυχής σύνδεση με Viva.com OAuth2.',
      });
    }

    return res.status(502).json({
      valid: false,
      error: 'Μη αναμενόμενη απάντηση από τη Viva.',
    });
  } catch (err) {
    return res.status(500).json({
      valid: false,
      error: `Σφάλμα επικοινωνίας με τη Viva: ${err.message}`,
    });
  }
}
