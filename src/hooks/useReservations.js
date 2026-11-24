import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const PAYMENT_LABELS = {
  scooter_deposit: 'Προκαταβολή 30% μηχανής',
  full: 'Ολόκληρο ποσό',
  combo_deposit: 'Δωμάτιο ολόκληρο + 30% μηχανής',
  full_refundable: 'Ολόκληρο – Επιστρέψιμο',
  full_nonrefundable: 'Ολόκληρο – Μη επιστρέψιμο (-10%)',
};

function mapBooking(b) {
  return {
    id: b.id,
    booking_code: b.booking_code,
    title: `${b.booking_code ? `[${b.booking_code}] ` : ''}${b.first_name} ${b.last_name} - ${b.vehicle_name}`,
    start_time: new Date(b.start_date),
    end_time: new Date(b.end_date),
    type: b.apartment_id ? 'apartment' : (b.vehicle_name || '').toLowerCase().includes('apartment') || (b.vehicle_name || '').toLowerCase().includes('διαμέρισμα') ? 'apartment' : 'scooter',
    status: b.status || 'pending',
    raw_status: b.status || 'pending',
    customer_details: `${b.phone} | ${b.email} ${b.notes ? `| Notes: ${b.notes}` : ''}`,
    raw_notes: b.notes || '',
    payment: b.payment_option ? {
      option: b.payment_option,
      label: PAYMENT_LABELS[b.payment_option] || b.payment_option,
      status: b.payment_status || 'pending',
      refundable: b.refundable,
      total: Number(b.amount_total || 0),
      dueNow: Number(b.amount_due_now || 0),
      paid: Number(b.amount_paid || 0),
      discount: Number(b.amount_discount || 0),
      orderCode: b.viva_order_code,
      transactionId: b.viva_transaction_id,
    } : null,
  };
}

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
      const parsedData = (data || []).map(mapBooking);

      setReservations(parsedData);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.message);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateReservation(id, updates) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select('*');

      if (error) throw error;
      
      if (data && data.length > 0) {
        const updatedRes = mapBooking(data[0]);
        setReservations(prev => prev.map(r => r.id === id ? updatedRes : r));
      }
      return { success: true };
    } catch (err) {
      console.error('Error updating reservation:', err);
      return { success: false, error: err.message };
    }
  }

  async function deleteReservation(id) {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReservations(prev => prev.filter(r => r.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting reservation:', err);
      return { success: false, error: err.message };
    }
  }

  return {
    reservations,
    loading,
    error,
    updateReservation,
    deleteReservation,
    refreshReservations: fetchReservations
  };
}
