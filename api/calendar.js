import { createClient } from '@supabase/supabase-js';
import { HOSTHUB_RENTALS } from './_lib/hosthub.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).send('Supabase credentials missing from environment.');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Filter options:
  // /api/calendar?room=two-bedroom
  // /api/calendar?apartmentId=deluxe-queen
  // /api/calendar?hosthubId=26h6xx3s78
  const { room, apartmentId, hosthubId } = req.query;
  const filterKey = (room || apartmentId || hosthubId || '').toLowerCase().trim();

  // Find matching Hosthub rental if filter was provided
  const targetRental = filterKey
    ? HOSTHUB_RENTALS.find((r) =>
        r.id.toLowerCase() === filterKey ||
        r.hosthub_id.toLowerCase() === filterKey ||
        r.name.toLowerCase().includes(filterKey) ||
        filterKey.includes(r.id.toLowerCase())
      )
    : null;

  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .in('status', ['confirmed', 'pending'])
      .neq('payment_status', 'failed');

    if (error) {
      throw error;
    }

    // Filter bookings for this apartment
    let apartmentBookings = (bookings || []).filter((b) => {
      // Exclude pure scooter bookings
      const name = (b.vehicle_name || '').toLowerCase();
      const hasAptKeyword =
        name.includes('apartment') ||
        name.includes('διαμέρισμα') ||
        name.includes('studio') ||
        name.includes('floor') ||
        name.includes('όροφος') ||
        name.includes('yard');
      const hasAptId = Boolean(b.apartment_id);
      return hasAptKeyword || hasAptId;
    });

    if (targetRental) {
      apartmentBookings = apartmentBookings.filter((b) => {
        // Direct id match
        if (b.apartment_id && String(b.apartment_id) === String(targetRental.id)) return true;
        // Text name match
        const vName = (b.vehicle_name || '').toLowerCase();
        return (
          vName.includes(targetRental.name.toLowerCase()) ||
          vName.includes(targetRental.title_el.toLowerCase()) ||
          (targetRental.id === 'two-bedroom' && (vName.includes('two bedroom') || vName.includes('1st floor'))) ||
          (targetRental.id === 'deluxe-queen' && (vName.includes('queen') || vName.includes('deluxe studio with queen'))) ||
          (targetRental.id === 'studio-yard' && (vName.includes('yard') || vName.includes('αυλή'))) ||
          (targetRental.id === 'standard-studio' && vName.includes('standard studio')) ||
          (targetRental.id === 'second-floor-4' && vName.includes('number 4')) ||
          (targetRental.id === 'second-floor-1' && vName.includes('number 1')) ||
          (targetRental.id === 'second-floor-deluxe' && (vName.includes('second floor deluxe') || vName.includes('2ος όροφος deluxe')))
        );
      });
    } else if (filterKey) {
      // Generic substring filter
      apartmentBookings = apartmentBookings.filter((b) =>
        (b.vehicle_name || '').toLowerCase().includes(filterKey)
      );
    }

    // Generate iCal string
    const calName = targetRental ? targetRental.name : 'All Apartments';
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `X-WR-CALNAME:Hermanos Rentals - ${calName}`,
      'PRODID:-//Hermanos Rentals//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    apartmentBookings.forEach((booking) => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      // iCal all-day events are exclusive of end date
      end.setDate(end.getDate() + 1);

      const formatIcalDate = (date) => date.toISOString().split('T')[0].replace(/-/g, '');

      const uid = `${booking.booking_code || booking.id}@hermanosrentals.com`;
      const stamp = formatIcalDate(new Date()) + 'T000000Z';
      const cleanName = (booking.vehicle_name || 'Apartment Booking').replace(/,/g, '\\,');

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${formatIcalDate(start)}`,
        `DTEND;VALUE=DATE:${formatIcalDate(end)}`,
        `SUMMARY:Hermanos [${booking.booking_code || 'Direct'}] - ${cleanName}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filterKey || 'apartments'}-calendar.ics"`);
    res.status(200).send(icsContent.join('\r\n'));
  } catch (err) {
    console.error('Calendar generation error:', err);
    res.status(500).json({ error: 'Failed to generate calendar', details: err.message });
  }
}
