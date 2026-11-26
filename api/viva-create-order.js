import { getSupabaseAdmin, getVivaSettings, getVivaAccessToken, vivaUrls } from './_lib/viva.js';
import { HOSTHUB_RENTALS, checkHosthubAvailability } from './_lib/hosthub.js';
import { calculateDays, computePayment, PAYMENT_OPTION_LABELS } from '../src/lib/pricing.js';

const PENDING_PAYMENT_TTL_MS = 30 * 60 * 1000; // unpaid bookings stop blocking dates after 30'

function generateBookingCode() {
  return 'HRM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) <= new Date(bEnd) && new Date(aEnd) >= new Date(bStart);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const {
    firstName, lastName, birthDate, email, phone, startDate, endDate, notes,
    apartmentId, scooterId, paymentOption, lang,
  } = body;
  const isGreek = (lang || '').startsWith('el');

  if (!firstName || !lastName || !email || !phone || !startDate || !endDate) {
    return res.status(400).json({ error: isGreek ? 'Συμπληρώστε όλα τα στοιχεία.' : 'Please fill in all fields.' });
  }
  if (!apartmentId && !scooterId) {
    return res.status(400).json({ error: isGreek ? 'Επιλέξτε δωμάτιο ή μηχανή.' : 'Select an apartment or scooter.' });
  }
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ error: isGreek ? 'Η ημερομηνία λήξης είναι πριν την έναρξη.' : 'End date is before start date.' });
  }

  try {
    const supabase = getSupabaseAdmin();

    // 1. Load items and prices from the database (never trust client prices)
    let apartment = null;
    let scooter = null;
    if (apartmentId) {
      const { data } = await supabase.from('apartments').select('*').eq('id', apartmentId).maybeSingle();
      if (data) {
        apartment = data;
      } else {
        const hh = HOSTHUB_RENTALS.find((r) => r.id === apartmentId || r.hosthub_id === apartmentId);
        if (hh) {
          apartment = hh;
        } else {
          throw new Error(isGreek ? 'Το δωμάτιο δεν βρέθηκε.' : 'Apartment not found.');
        }
      }
    }
    if (scooterId) {
      const { data, error } = await supabase.from('scooters').select('*').eq('id', scooterId).maybeSingle();
      if (error || !data) throw new Error(isGreek ? 'Η μηχανή δεν βρέθηκε.' : 'Scooter not found.');
      scooter = data;
    }

    const apartmentName = apartment ? (isGreek ? apartment.title_el : apartment.title_en) || apartment.title_en : null;
    const scooterName = scooter ? scooter.name : null;

    // 2. Real-time availability check via Hosthub API
    const targetHosthubId = apartment?.hosthub_id ||
      HOSTHUB_RENTALS.find((r) => r.id === apartment?.id || r.name.toLowerCase() === (apartment?.title_en || '').toLowerCase())?.hosthub_id;

    if (targetHosthubId) {
      const isFreeInHosthub = await checkHosthubAvailability(targetHosthubId, startDate, endDate);
      if (!isFreeInHosthub) {
        return res.status(409).json({
          error: isGreek
            ? 'Το επιλεγμένο κατάλυμα είναι ήδη κλεισμένο για αυτές τις ημερομηνίες (από Booking.com / Airbnb μέσω Hosthub).'
            : 'Selected apartment is already booked for these dates (Hosthub / Booking.com sync).',
        });
      }
    }

    // 2b. Hermanos direct bookings availability check
    const { data: existing, error: exErr } = await supabase
      .from('bookings')
      .select('*')
      .neq('status', 'cancelled');
    if (exErr) throw exErr;

    const now = Date.now();
    const conflict = (existing || []).some((b) => {
      if (!overlaps(startDate, endDate, b.start_date, b.end_date)) return false;
      if (b.payment_status === 'failed') return false;
      if (b.payment_status === 'pending' && b.created_at && now - new Date(b.created_at).getTime() > PENDING_PAYMENT_TTL_MS) {
        return false;
      }
      const name = (b.vehicle_name || '').toLowerCase();
      const aptHit = apartment && (
        (b.apartment_id != null && String(b.apartment_id) === String(apartment.id)) ||
        (b.apartment_id == null && [apartment.title_en, apartment.title_el].filter(Boolean).some((n) => name.includes(n.toLowerCase())))
      );
      const sctHit = scooter && (
        (b.scooter_id != null && String(b.scooter_id) === String(scooter.id)) ||
        (b.scooter_id == null && scooter.name && name.includes(scooter.name.toLowerCase()))
      );
      return aptHit || sctHit;
    });

    if (conflict) {
      return res.status(409).json({
        error: isGreek
          ? 'Κάποιο από τα επιλεγμένα είναι ήδη κρατημένο για αυτές τις ημερομηνίες.'
          : 'One or more selected items are already booked for these dates.',
      });
    }

    // 3. Compute the amount on the server
    const days = calculateDays(startDate, endDate);
    const pay = computePayment({
      apartmentPrice: apartment?.price,
      scooterPrice: scooter?.price,
      days,
      hasApartment: Boolean(apartment),
      hasScooter: Boolean(scooter),
      option: paymentOption,
    });

    const amountCents = Math.round(pay.dueNow * 100);
    if (amountCents < 30) {
      return res.status(400).json({ error: isGreek ? 'Μη έγκυρο ποσό πληρωμής.' : 'Invalid payment amount.' });
    }

    // 4. Viva settings + token
    const settings = await getVivaSettings(supabase);
    const accessToken = await getVivaAccessToken(settings);
    const urls = vivaUrls(settings.environment);

    // 5. Insert booking as pending payment
    const bookingCode = generateBookingCode();
    const vehicleName = [apartmentName, scooterName].filter(Boolean).join(' & ');
    const optionLabel = PAYMENT_OPTION_LABELS[pay.option]?.[isGreek ? 'el' : 'en'] || pay.option;

    const combinedNotes = [
      birthDate ? `Birth Date: ${birthDate}` : null,
      notes || null,
    ].filter(Boolean).join(' | ');

    const { data: inserted, error: insErr } = await supabase
      .from('bookings')
      .insert([{
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate || null,
        email,
        phone,
        start_date: startDate,
        end_date: endDate,
        vehicle_name: vehicleName,
        notes: combinedNotes,
        booking_code: bookingCode,
        status: 'pending',
        apartment_id: apartment ? apartment.id : null,
        scooter_id: scooter ? scooter.id : null,
        payment_option: pay.option,
        refundable: pay.refundable,
        amount_total: pay.total,
        amount_due_now: pay.dueNow,
        amount_discount: pay.discount,
        amount_paid: 0,
        payment_status: 'pending',
      }])
      .select()
      .maybeSingle();

    if (insErr) {
      throw new Error(
        `${insErr.message}. (Τρέξτε το supabase_payments_setup.sql στο Supabase για τα νέα πεδία πληρωμής.)`
      );
    }

    // 6. Create Viva payment order
    const orderRes = await fetch(`${urls.api}/checkout/v2/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountCents,
        customerTrns: `Hermanos ${bookingCode} – ${vehicleName} (${startDate} → ${endDate}) – ${optionLabel}`.slice(0, 2048),
        customer: {
          email,
          fullName: `${firstName} ${lastName}`.slice(0, 100),
          phone: String(phone).slice(0, 30),
          requestLang: isGreek ? 'el-GR' : 'en-GB',
        },
        paymentTimeout: 1800,
        preauth: false,
        allowRecurring: false,
        disableCash: true,
        sourceCode: settings.source_code,
        merchantTrns: bookingCode,
        tags: ['hermanos', pay.option],
      }),
    });

    if (!orderRes.ok) {
      const text = await orderRes.text();
      if (inserted?.id) {
        await supabase.from('bookings').update({ payment_status: 'failed', status: 'cancelled' }).eq('id', inserted.id);
      }
      throw new Error(`Viva order failed (HTTP ${orderRes.status}): ${text.slice(0, 300)}`);
    }

    const order = await orderRes.json();
    const orderCode = String(order.orderCode);

    if (inserted?.id) {
      await supabase.from('bookings').update({ viva_order_code: orderCode }).eq('id', inserted.id);
    } else {
      await supabase.from('bookings').update({ viva_order_code: orderCode }).eq('booking_code', bookingCode);
    }

    return res.status(200).json({
      bookingCode,
      orderCode,
      checkoutUrl: `${urls.web}/web/checkout?ref=${orderCode}`,
      payment: pay,
      vehicleName,
    });
  } catch (err) {
    console.error('viva-create-order error:', err);
    return res.status(500).json({ error: err.message || 'Payment error' });
  }
}
