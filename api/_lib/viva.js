// Shared server-side helpers for Viva.com Smart Checkout.
// Files in api/_lib are not exposed as routes by Vercel.
import { createClient } from '@supabase/supabase-js';
import { HOSTHUB_RENTALS, createHosthubBookingEvent } from './hosthub.js';

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase credentials missing from environment.');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export function vivaUrls(environment) {
  const live = environment === 'live';
  return {
    token: live
      ? 'https://accounts.vivapayments.com/connect/token'
      : 'https://demo-accounts.vivapayments.com/connect/token',
    api: live ? 'https://api.vivapayments.com' : 'https://demo-api.vivapayments.com',
    web: live ? 'https://www.vivapayments.com' : 'https://demo.vivapayments.com',
  };
}

export async function getVivaSettings(supabase) {
  const { data, error } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('provider', 'viva')
    .maybeSingle();

  if (error) {
    throw new Error(
      'Δεν βρέθηκαν ρυθμίσεις Viva στη βάση. Τρέξτε το supabase_viva_setup.sql και αποθηκεύστε ξανά τα στοιχεία στο /admin.'
    );
  }
  if (!data || !data.is_connected || !data.client_id || !data.client_secret || !data.source_code) {
    throw new Error('Η Viva δεν έχει συνδεθεί ακόμα από το διαχειριστικό.');
  }
  return data;
}

export async function getVivaAccessToken(settings) {
  const { token } = vivaUrls(settings.environment);
  const basic = Buffer.from(`${settings.client_id}:${settings.client_secret}`).toString('base64');
  const res = await fetch(token, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    throw new Error(`Viva OAuth failed (HTTP ${res.status}). Ελέγξτε Client ID / Secret και Demo/Live.`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error('Viva OAuth: no access token returned.');
  return data.access_token;
}

export async function getVivaTransaction(settings, transactionId) {
  const accessToken = await getVivaAccessToken(settings);
  const { api } = vivaUrls(settings.environment);
  const res = await fetch(`${api}/checkout/v2/transactions/${encodeURIComponent(transactionId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Viva transaction lookup failed (HTTP ${res.status}).`);
  }
  return res.json();
}

/**
 * Verifies a transaction directly with Viva and updates the matching booking.
 * Safe to call multiple times (webhook + success page).
 */
export async function confirmBookingFromTransaction(supabase, settings, transactionId) {
  const tx = await getVivaTransaction(settings, transactionId);
  const orderCode = tx.orderCode != null ? String(tx.orderCode) : null;
  if (!orderCode) throw new Error('Transaction has no order code.');

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('viva_order_code', orderCode)
    .maybeSingle();

  if (error) throw error;
  if (!booking) return { found: false, orderCode, statusId: tx.statusId };

  // statusId: F = finished (paid), A = active/pending, E/X = error/cancelled, R = refunded
  if (tx.statusId === 'F') {
    const paid = Number(tx.amount || 0);
    const isDeposit = Number(booking.amount_total || 0) - paid > 0.009;
    const updates = {
      payment_status: isDeposit ? 'deposit_paid' : 'paid',
      amount_paid: paid,
      viva_transaction_id: String(transactionId),
      status: 'confirmed',
    };
    const { error: upErr } = await supabase.from('bookings').update(updates).eq('id', booking.id);
    if (upErr) throw upErr;

    // Immediately sync with Hosthub to block the apartment on Booking.com / Airbnb!
    if (booking.apartment_id && booking.dates?.from && booking.dates?.to) {
      const rental = HOSTHUB_RENTALS.find(
        (r) => r.id === booking.apartment_id || r.hosthub_id === booking.apartment_id
      );
      if (rental) {
        try {
          await createHosthubBookingEvent({
            hosthubRentalId: rental.hosthub_id,
            startDate: booking.dates.from,
            endDate: booking.dates.to,
            guestName: `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim(),
            guestEmail: booking.customer?.email,
            guestPhone: booking.customer?.phone,
            pax: booking.apartment_guests || 2,
            bookingCode: booking.booking_code,
          });
        } catch (hhErr) {
          console.error('Failed to notify Hosthub for booking:', booking.booking_code, hhErr);
        }
      }
    }

    return { found: true, paid: true, bookingCode: booking.booking_code, ...updates };
  }

  if (tx.statusId === 'E' || tx.statusId === 'X') {
    await supabase
      .from('bookings')
      .update({ payment_status: 'failed', viva_transaction_id: String(transactionId) })
      .eq('id', booking.id);
    return { found: true, paid: false, bookingCode: booking.booking_code, payment_status: 'failed' };
  }

  return { found: true, paid: false, bookingCode: booking.booking_code, statusId: tx.statusId };
}
