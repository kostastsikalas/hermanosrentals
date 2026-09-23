import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) throw error;
      
      // Parse ISO strings back to Date objects for react-big-calendar
      // Map bookings table schema to what AdminCalendar expects
      const parsedData = (data || []).map(b => ({
        id: b.id,
        booking_code: b.booking_code,
        title: `${b.booking_code ? `[${b.booking_code}] ` : ''}${b.first_name} ${b.last_name} - ${b.vehicle_name}`,
        start_time: new Date(b.start_date),
        end_time: new Date(b.end_date),
        type: (b.vehicle_name || '').toLowerCase().includes('apartment') || (b.vehicle_name || '').toLowerCase().includes('διαμέρισμα') ? 'apartment' : 'scooter',
        status: b.status || 'pending',
        customer_details: `${b.phone} | ${b.email} ${b.notes ? `| Notes: ${b.notes}` : ''}`
      }));

      setReservations(parsedData);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.message);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }

  return {
    reservations,
    loading,
    error,
    refreshReservations: fetchReservations
  };
}
