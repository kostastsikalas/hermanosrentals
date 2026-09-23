import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import el from 'date-fns/locale/el';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useReservations } from '../../hooks/useReservations';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import './AdminCalendar.css'; // Custom overrides for tailwind

const locales = {
  'el': el,
  'en': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const AdminCalendar = () => {
  const { i18n } = useTranslation();
  const { reservations, loading, updateReservation, deleteReservation } = useReservations();
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState('pending');
  const [editNotes, setEditNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm w-full h-[600px]">
        <Loader2 className="animate-spin text-cyan-500" size={48} />
      </div>
    );
  }

  const events = reservations.map(res => ({
    id: res.id,
    title: res.title,
    start: res.start_time,
    end: res.end_time,
    type: res.type,
    status: res.status,
    customer: res.customer_details,
    raw_status: res.raw_status,
    raw_notes: res.raw_notes
  }));

  const eventStyleGetter = (event) => {
    let backgroundColor = '#0f172a';
    if (event.type === 'scooter') {
      backgroundColor = '#06b6d4';
    } else if (event.type === 'apartment') {
      backgroundColor = '#10b981';
    }
    if (event.status === 'pending') {
      backgroundColor = '#f59e0b';
    }
    return {
      style: { backgroundColor, borderRadius: '8px', opacity: 0.9, color: 'white', border: '0px', display: 'block' }
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsEditing(false);
    setEditStatus(event.raw_status || 'pending');
    setEditNotes(event.raw_notes || '');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateReservation(selectedEvent.id, {
      status: editStatus,
      notes: editNotes
    });
    setIsSaving(false);
    if (res.success) {
      // update local selected event so view mode reflects changes
      setSelectedEvent({
        ...selectedEvent,
        status: editStatus,
        raw_status: editStatus,
        raw_notes: editNotes
      });
      setIsEditing(false);
    } else {
      alert('Failed to update booking: ' + res.error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτή την κράτηση οριστικά;')) {
      const res = await deleteReservation(selectedEvent.id);
      if (res.success) {
        setSelectedEvent(null);
      } else {
        alert('Failed to delete booking: ' + res.error);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
      <div className="mb-6 flex gap-4 text-sm font-medium">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-cyan-500"></div> Scooters
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-500"></div> Apartments
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div> Pending
        </div>
      </div>

      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture={i18n.language === 'el' ? 'el' : 'en'}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
        />
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-4 pr-8">{selectedEvent.title}</h2>
            
            {!isEditing ? (
              <div className="space-y-3 text-slate-600">
                <p><strong>Type:</strong> <span className="capitalize">{selectedEvent.type}</span></p>
                <p><strong>Status:</strong> <span className="capitalize px-2 py-1 bg-slate-100 rounded-md text-slate-800">{selectedEvent.status}</span></p>
                <p><strong>Start:</strong> {format(selectedEvent.start, 'PPp', { locale: locales[i18n.language === 'el' ? 'el' : 'en'] })}</p>
                <p><strong>End:</strong> {format(selectedEvent.end, 'PPp', { locale: locales[i18n.language === 'el' ? 'el' : 'en'] })}</p>
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 mb-1">Customer Details:</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedEvent.customer}</p>
                </div>
                
                <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-slate-600">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                  <textarea 
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                    placeholder="Add private notes or edit customer notes..."
                  />
                </div>
                
                <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-medium transition-colors"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                  >
                    {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCalendar;
