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
        .from('reservations')
        .select('*');

      if (error) throw error;
      
      // Parse ISO strings back to Date objects for react-big-calendar
      const parsedData = (data || []).map(res => ({
        ...res,
        start_time: new Date(res.start_time),
        end_time: new Date(res.end_time)
      }));

      setReservations(parsedData);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.message);
      // Fallback dummy data if table is missing or error
      setReservations([
        {
          id: 'dummy-1',
          title: 'Booking: Vespa Primavera - Kostas',
          start_time: new Date(),
          end_time: new Date(new Date().setHours(new Date().getHours() + 48)),
          type: 'scooter',
          status: 'confirmed',
          customer_details: 'Kostas T. - +30 6900000000'
        },
        {
          id: 'dummy-2',
          title: 'Booking: Sea View Apt - Maria',
          start_time: new Date(new Date().setDate(new Date().getDate() + 2)),
          end_time: new Date(new Date().setDate(new Date().getDate() + 7)),
          type: 'apartment',
          status: 'pending',
          customer_details: 'Maria K. - +30 6911111111'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function addReservation(reservation) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservation])
        .select();

      if (error) throw error;
      if (data) {
        const newRes = {
          ...data[0],
          start_time: new Date(data[0].start_time),
          end_time: new Date(data[0].end_time)
        };
        setReservations(prev => [...prev, newRes]);
      }
      return { success: true };
    } catch (err) {
      console.error('Error adding reservation:', err);
      return { success: false, error: err.message };
    }
  }

  return {
    reservations,
    loading,
    error,
    addReservation,
    refreshReservations: fetchReservations
  };
}
