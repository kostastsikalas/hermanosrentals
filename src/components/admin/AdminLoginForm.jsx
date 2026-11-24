import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ADMIN_EMAIL = 'hermanosrentals@gmail.com';
const ADMIN_PASS = 'rentals2026';
const SESSION_KEY = 'hermanos_admin_session';

export function checkAdminSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    // Session valid if email matches and session is active
    return session && session.email === ADMIN_EMAIL && session.isAuthenticated === true;
  } catch {
    return false;
  }
}

export function setAdminSession() {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        email: ADMIN_EMAIL,
        isAuthenticated: true,
        loginTime: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.warn('Could not save admin session:', err);
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.warn('Could not clear admin session:', err);
  }
}

const AdminLoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      if (cleanEmail === ADMIN_EMAIL && cleanPass === ADMIN_PASS) {
        setAdminSession();
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Λάθος email ή κωδικός πρόσβασης. Δοκιμάστε ξανά.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Hermanos <span className="text-cyan-400 font-normal">Admin</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Είσοδος στο διαχειριστικό σύστημα
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email Διαχειριστή
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="hermanosrentals@gmail.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Κωδικός Πρόσβασης
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-700 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                aria-label={showPassword ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/20 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Έλεγχος...
              </>
            ) : (
              'Είσοδος'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Επιστροφή στην ιστοσελίδα
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm;
