import React, { useEffect } from 'react';

const AdminScooters = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-12 min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Admin Dashboard</h1>
        <p className="text-slate-600">Admin management interface placeholder.</p>
      </div>
    </div>
  );
};

export default AdminScooters;
