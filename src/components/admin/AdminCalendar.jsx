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
  const { reservations, loading } = useReservations();
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm w-full h-[600px]">
        <Loader2 className="animate-spin text-cyan-500" size={48} />
      </div>
    );
  }

  // Format events for react-big-calendar
  const events = reservations.map(res => ({
    id: res.id,
    title: res.title,
    start: res.start_time,
    end: res.end_time,
    type: res.type, // 'scooter' or 'apartment'
    status: res.status,
    customer: res.customer_details
  }));

  const eventStyleGetter = (event) => {
    let backgroundColor = '#0f172a'; // slate-900 (default)
    
    if (event.type === 'scooter') {
      backgroundColor = '#06b6d4'; // cyan-500
    } else if (event.type === 'apartment') {
      backgroundColor = '#10b981'; // emerald-500
    }

    if (event.status === 'pending') {
      backgroundColor = '#f59e0b'; // amber-500
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
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

      {/* Simple Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedEvent.title}</h2>
            <div className="space-y-3 text-slate-600">
              <p><strong>Type:</strong> <span className="capitalize">{selectedEvent.type}</span></p>
              <p><strong>Status:</strong> <span className="capitalize">{selectedEvent.status}</span></p>
              <p><strong>Start:</strong> {format(selectedEvent.start, 'PPp', { locale: locales[i18n.language === 'el' ? 'el' : 'en'] })}</p>
              <p><strong>End:</strong> {format(selectedEvent.end, 'PPp', { locale: locales[i18n.language === 'el' ? 'el' : 'en'] })}</p>
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-900 mb-1">Customer Details:</p>
                <p className="text-sm">{selectedEvent.customer}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCalendar;
