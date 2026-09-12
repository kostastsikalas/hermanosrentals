import React, { useEffect } from 'react';

const ApartmentsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-12 min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Holiday Apartments</h1>
        <p className="text-slate-600">Coming soon in Phase 2...</p>
      </div>
    </div>
  );
};

export default ApartmentsPage;
