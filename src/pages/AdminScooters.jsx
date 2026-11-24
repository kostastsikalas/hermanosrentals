import React, { useState, useEffect } from 'react';
import { useScooters } from '../hooks/useScooters';
import { useApartments } from '../hooks/useApartments';
import { useVivaSettings } from '../hooks/useVivaSettings';
import ScooterFormModal from '../components/admin/ScooterFormModal';
import ApartmentFormModal from '../components/admin/ApartmentFormModal';
import AdminCalendar from '../components/admin/AdminCalendar';
import AdminVivaSettings from '../components/admin/AdminVivaSettings';
import AdminLoginForm, { checkAdminSession, clearAdminSession } from '../components/admin/AdminLoginForm';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Calendar, Bike, Building2, CreditCard, CheckCircle2, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAdminSession());
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'scooters', 'apartments', 'viva'
  
  // Viva Payment Settings State
  const viva = useVivaSettings();
  
  // Scooter State
  const { scooters, loading: scootersLoading, error: scootersError, addScooter, updateScooter, deleteScooter, uploadImage } = useScooters();
  const [isScooterModalOpen, setIsScooterModalOpen] = useState(false);
  const [editingScooter, setEditingScooter] = useState(null);

  // Apartment State
  const { apartments, loading: apartmentsLoading, error: apartmentsError, addApartment, updateApartment, deleteApartment, uploadImages } = useApartments();
  const [isApartmentModalOpen, setIsApartmentModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddScooterClick = () => {
    setEditingScooter(null);
    setIsScooterModalOpen(true);
  };

  const handleEditScooterClick = (scooter) => {
    setEditingScooter(scooter);
    setIsScooterModalOpen(true);
  };

  const handleDeleteScooterClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this scooter?')) {
      await deleteScooter(id);
    }
  };

  const handleSaveScooter = async (scooterData) => {
    if (editingScooter) {
      await updateScooter(editingScooter.id, scooterData);
    } else {
      await addScooter(scooterData);
    }
    setIsScooterModalOpen(false);
  };

  const handleAddApartmentClick = () => {
    setEditingApartment(null);
    setIsApartmentModalOpen(true);
  };

  const handleEditApartmentClick = (apartment) => {
    setEditingApartment(apartment);
    setIsApartmentModalOpen(true);
  };

  const handleDeleteApartmentClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this apartment?')) {
      await deleteApartment(id);
    }
  };

  const handleSaveApartment = async (apartmentData) => {
    if (editingApartment) {
      await updateApartment(editingApartment.id, apartmentData);
    } else {
      await addApartment(apartmentData);
    }
    setIsApartmentModalOpen(false);
  };

  if (!isAuthenticated) {
    return <AdminLoginForm onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <button
              onClick={() => {
                clearAdminSession();
                setIsAuthenticated(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors self-start sm:self-auto border border-slate-200"
              title="Αποσύνδεση από το διαχειριστικό"
            >
              <LogOut size={16} />
              Αποσύνδεση
            </button>
          </div>
          
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === 'calendar'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Calendar size={18} />
              Reservations Calendar
            </button>
            <button
              onClick={() => setActiveTab('scooters')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === 'scooters'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Bike size={18} />
              Scooter Fleet
            </button>
            <button
              onClick={() => setActiveTab('apartments')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === 'apartments'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Building2 size={18} />
              Apartments
            </button>
            <button
              onClick={() => setActiveTab('viva')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === 'viva'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <CreditCard size={18} />
              Viva Payments
              {viva.isConnected && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} />
                  Έχει ήδη συνδεθεί
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <div className="animate-in fade-in duration-300">
            <AdminCalendar />
          </div>
        )}

        {/* Scooters View */}
        {activeTab === 'scooters' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-end mb-6">
              <button 
                onClick={handleAddScooterClick}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
              >
                <Plus size={20} />
                Add New Scooter
              </button>
            </div>

            {scootersError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <p className="text-sm">Error connecting to database: {scootersError}. Falling back to default data.</p>
              </div>
            )}

            {scootersLoading ? (
              <div className="flex justify-center items-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Loader2 className="animate-spin text-cyan-500" size={48} />
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600">Scooter</th>
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600">Category</th>
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600">CC</th>
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600">Status</th>
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600">Price/Day</th>
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {scooters.map(scooter => (
                        <tr key={scooter.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={scooter.image} alt={scooter.name} className="w-16 h-12 object-cover rounded-lg" />
                              <span className="font-semibold text-slate-900">{scooter.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium">{scooter.category}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{scooter.cc}cc</td>
                          <td className="px-6 py-4">
                            {scooter.status === 'on_request' ? (
                              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">On Request</span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">Available</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-900 font-medium">€{scooter.price}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEditScooterClick(scooter)}
                                className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteScooterClick(scooter.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {scooters.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                            No scooters found. Click "Add New Scooter" to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Apartments View */}
        {activeTab === 'apartments' && (
          <div className="animate-in fade-in duration-300">
            {/* Hosthub Live Sync Info Banner */}
            <div className="mb-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    HH
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      Hosthub Live Sync (7 Καταλύματα)
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        Συνδεδεμένο API
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Οι τιμές και η διαθεσιμότητα συγχρονίζονται με το Hosthub (Booking.com / Airbnb)
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="py-2 pr-4 font-semibold">Κατάλυμα Hosthub</th>
                      <th className="py-2 px-4 font-semibold">Τιμή / Βραδιά</th>
                      <th className="py-2 px-4 font-semibold">Άτομα</th>
                      <th className="py-2 px-4 font-semibold">Hosthub ID</th>
                      <th className="py-2 pl-4 font-semibold text-right">iCal Link για Hosthub</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {[
                      { name: 'Two Bedroom Apartment', price: '€98.00', guests: 6, hhId: '26h6xx3s78', link: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/calendar?room=two-bedroom` },
                      { name: 'Deluxe Studio with Queen size bed', price: '€65.00', guests: 2, hhId: 'havcyt1asp', link: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/calendar?room=deluxe-queen` },
                      { name: 'Second floor number 4', price: '€63.00', guests: 2, hhId: 'sfr8dwynnm', link: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/calendar?room=second-floor-4` },
                      { name: 'Second floor deluxe studio', price: '€60.00', guests: 2, hhId: '2m1upswrc1', link: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/calendar?room=second-floor-deluxe` },
                      { name: 'Standard studio', price: '€59.00', guests: 2, hhId: 's8t2qech6g', link: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/calendar?room=standard-studio` },
                      { name: 'second floor number 1', price: '€55.00', guests: 2, hhId: 'ed8ez4rnuh', link: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/calendar?room=second-floor-1` },
                      { name: 'Studio with yard', price: '€53.00', guests: 2, hhId: '6n5b3d8y2x', link: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/calendar?room=studio-yard` },
                    ].map((item) => (
                      <tr key={item.hhId} className="hover:bg-slate-50/50">
                        <td className="py-2.5 pr-4 font-medium text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-4 font-bold text-cyan-600">{item.price}</td>
                        <td className="py-2.5 px-4">{item.guests}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-400">{item.hhId}</td>
                        <td className="py-2.5 pl-4 text-right">
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(item.link)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 font-medium transition-colors text-xs"
                            title="Αντιγραφή iCal URL για να το επικολλήσετε στο Hosthub"
                          >
                            Αντιγραφή iCal
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <button 
                onClick={handleAddApartmentClick}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
              >
                <Plus size={20} />
                Add New Apartment
              </button>
            </div>

            {apartmentsError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <p className="text-sm">Error connecting to database: {apartmentsError}. Falling back to default data.</p>
              </div>
            )}

            {apartmentsLoading ? (
              <div className="flex justify-center items-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Loader2 className="animate-spin text-cyan-500" size={48} />
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600">Apartment</th>
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600">Floor/Size</th>
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600">Capacity</th>
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600">Status</th>
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600">Price/Night</th>
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600">Amenities</th>
                        <th className="px-6 py-4 font-semibold text-sm text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {apartments.map(apartment => (
                        <tr key={apartment.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              {apartment?.images && apartment?.images.length > 0 ? (
                                <img src={apartment?.images[0]} alt={apartment.title_en} className="w-16 h-12 object-cover rounded-lg" />
                              ) : (
                                <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                  <Building2 size={24} />
                                </div>
                              )}
                              <span className="font-semibold text-slate-900">{apartment.title_en}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{apartment.floor_en}</td>
                          <td className="px-6 py-4 text-slate-600">{apartment.capacity} Persons</td>
                          <td className="px-6 py-4">
                            {apartment.status === 'available' ? (
                              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">Available</span>
                            ) : (
                              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">{apartment.status}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-900 font-medium">€{apartment.price || '0.00'}</td>
                          <td className="px-6 py-4 text-slate-500 text-sm">
                            {apartment.amenities_en?.length || 0} items
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEditApartmentClick(apartment)}
                                className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteApartmentClick(apartment.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {apartments.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                            No apartments found. Click "Add New Apartment" to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Viva Payments View */}
        {activeTab === 'viva' && (
          <div className="animate-in fade-in duration-300">
            <AdminVivaSettings viva={viva} />
          </div>
        )}

      </div>

      <ScooterFormModal 
        isOpen={isScooterModalOpen}
        onClose={() => setIsScooterModalOpen(false)}
        onSave={handleSaveScooter}
        onUploadImage={uploadImage}
        scooter={editingScooter}
      />

      <ApartmentFormModal
        isOpen={isApartmentModalOpen}
        onClose={() => setIsApartmentModalOpen(false)}
        onSave={handleSaveApartment}
        onUploadImages={uploadImages}
        apartment={editingApartment}
      />
    </div>
  );
};

export default AdminDashboard;
