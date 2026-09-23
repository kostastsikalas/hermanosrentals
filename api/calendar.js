import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).send('Supabase credentials missing from environment.');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Get optional query parameter to filter by specific room name
  // Example: /api/calendar?room=Luxury
  const { room } = req.query;

  try {
    // Fetch pending and confirmed bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .in('status', ['confirmed', 'pending']);

    if (error) {
      throw error;
    }

    // Filter only apartment bookings
    let apartmentBookings = bookings.filter(b => {
      const name = (b.vehicle_name || '').toLowerCase();
      return name.includes('apartment') || name.includes('διαμέρισμα') || name.includes('luxury') || name.includes('standard');
    });

    // If a specific room is requested, filter further
    if (room) {
      apartmentBookings = apartmentBookings.filter(b => 
        (b.vehicle_name || '').toLowerCase().includes(room.toLowerCase())
      );
    }

    // Generate iCal string
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hermanos Rentals//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    apartmentBookings.forEach(booking => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      
      // iCal end dates for all-day events are exclusive, so we add 1 day
      end.setDate(end.getDate() + 1);

      const formatIcalDate = (date) => {
        return date.toISOString().split('T')[0].replace(/-/g, '');
      };

      const uid = `${booking.id}@hermanosrentals.com`;
      const stamp = formatIcalDate(new Date()) + 'T000000Z';
      const cleanName = (booking.vehicle_name || 'Apartment Booking').replace(/,/g, '\\,');
      
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${formatIcalDate(start)}`,
        `DTEND;VALUE=DATE:${formatIcalDate(end)}`,
        `SUMMARY:Booking - ${cleanName}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="calendar.ics"');
    res.status(200).send(icsContent.join('\r\n'));

  } catch (err) {
    console.error('Calendar generation error:', err);
    res.status(500).json({ error: 'Failed to generate calendar', details: err.message });
  }
}
