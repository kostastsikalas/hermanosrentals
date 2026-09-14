import React, { useState, useEffect } from 'react';
import { useScooters } from '../hooks/useScooters';
import ScooterFormModal from '../components/admin/ScooterFormModal';
import AdminCalendar from '../components/admin/AdminCalendar';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, Calendar, Bike, Building2 } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'scooters', 'apartments'
  
  // Scooter State
  const { scooters, loading: scootersLoading, error: scootersError, addScooter, updateScooter, deleteScooter, uploadImage } = useScooters();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScooter, setEditingScooter] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddClick = () => {
    setEditingScooter(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (scooter) => {
    setEditingScooter(scooter);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this scooter?')) {
      await deleteScooter(id);
    }
  };

  const handleSave = async (scooterData) => {
    if (editingScooter) {
      await updateScooter(editingScooter.id, scooterData);
    } else {
      await addScooter(scooterData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>
          
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
                onClick={handleAddClick}
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
                          <td className="px-6 py-4 text-slate-900 font-medium">€{scooter.price}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEditClick(scooter)}
                                className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(scooter.id)}
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
                          <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
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

        {/* Apartments View (Coming Soon placeholder) */}
        {activeTab === 'apartments' && (
          <div className="animate-in fade-in duration-300 py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Building2 className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Apartment Management</h2>
            <p className="text-slate-500">Coming soon! Here you will manage your apartments, prices, and features.</p>
          </div>
        )}

      </div>

      <ScooterFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onUploadImage={uploadImage}
        scooter={editingScooter}
      />
    </div>
  );
};

export default AdminDashboard;
