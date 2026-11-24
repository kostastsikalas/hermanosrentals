import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Edit2,
  Unlink,
  ShieldCheck,
  AlertCircle,
  Info,
  RefreshCw,
  KeyRound,
  Building,
  Hash,
  Webhook,
} from 'lucide-react';

function maskSecret(value, visibleChars = 4) {
  if (!value) return '—';
  if (value.length <= visibleChars * 2) {
    return '•'.repeat(Math.max(8, value.length));
  }
  return `${value.slice(0, visibleChars)}••••••••${value.slice(-visibleChars)}`;
}

const RedirectUrlsBox = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const host = typeof window !== 'undefined' ? window.location.host : '';
  const rows = [
    { label: 'Domain', value: host },
    { label: 'Success URL', value: '/payment/success', full: `${origin}/payment/success` },
    { label: 'Failure URL', value: '/payment/failure', full: `${origin}/payment/failure` },
    { label: 'Webhook URL', value: `${origin}/api/viva-webhook`, full: `${origin}/api/viva-webhook` },
  ];
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-sky-50 border border-sky-200 text-sm">
      <p className="font-semibold text-slate-900 mb-1">URLs για το Viva Dashboard</p>
      <p className="text-slate-600 mb-3">
        Βάλτε τα στο Viva: Πωλήσεις → Online Πληρωμές → Ιστοσελίδες/Εφαρμογές → (η πηγή σας).
      </p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="w-28 shrink-0 text-xs font-medium text-slate-500">{r.label}</span>
            <code className="flex-1 bg-white border border-sky-100 rounded-lg px-3 py-1.5 font-mono text-slate-900 break-all">
              {r.value}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(r.value)}
              className="text-xs font-medium text-sky-700 hover:text-sky-900 px-2 py-1"
            >
              Αντιγραφή
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Πλήρεις διευθύνσεις: {rows[1].full} · {rows[2].full}
      </p>
    </div>
  );
};

const AdminVivaSettings = ({ viva }) => {
  const {
    settings,
    isConnected,
    loading,
    saving,
    storageMode,
    saveSettings,
    disconnectViva,
  } = viva;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    environment: 'demo',
    merchant_id: '',
    api_key: '',
    client_id: '',
    client_secret: '',
    source_code: '',
    webhook_key: '',
  });

  const [showSecrets, setShowSecrets] = useState({
    api_key: false,
    client_secret: false,
    webhook_key: false,
  });

  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: string }
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setFormData({
      environment: settings.environment || 'demo',
      merchant_id: settings.merchant_id || '',
      api_key: settings.api_key || '',
      client_id: settings.client_id || '',
      client_secret: settings.client_secret || '',
      source_code: settings.source_code || '',
      webhook_key: settings.webhook_key || '',
    });
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const toggleSecret = (field) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setStatusMessage(null);

    if (
      !formData.merchant_id.trim() ||
      !formData.api_key.trim() ||
      !formData.client_id.trim() ||
      !formData.client_secret.trim() ||
      !formData.source_code.trim()
    ) {
      setFormError('Παρακαλούμε συμπληρώστε όλα τα υποχρεωτικά στοιχεία της Viva.');
      return;
    }

    const result = await saveSettings(formData);
    if (result.success) {
      setIsEditing(false);
      setStatusMessage({
        type: 'success',
        text: 'Η σύνδεση με τη Viva ολοκληρώθηκε με επιτυχία.',
      });
    } else {
      setFormError(result.error || 'Αποτυχία αποθήκευσης στοιχείων Viva.');
    }
  };

  const handleDisconnect = async () => {
    const confirmed = window.confirm(
      'Είστε σίγουροι ότι θέλετε να αποσυνδέσετε τον λογαριασμό Viva; Θα χρειαστεί να εισάγετε ξανά τα στοιχεία για επανασύνδεση.'
    );
    if (!confirmed) return;

    setStatusMessage(null);
    await disconnectViva();
    setIsEditing(false);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    try {
      const response = await fetch('/api/viva-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: settings.client_id,
          client_secret: settings.client_secret,
          environment: settings.environment,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setStatusMessage({
          type: 'info',
          text: 'Η ζωντανή επαλήθευση OAuth2 εκτελείται όταν η εφαρμογή είναι ανεβασμένη στο Vercel (ή με vercel dev). Τα στοιχεία σας έχουν αποθηκευτεί κανονικά.',
        });
        return;
      }

      const data = await response.json();
      if (response.ok && data.valid) {
        setStatusMessage({
          type: 'success',
          text: 'Επιτυχής επαλήθευση με το Viva.com API! Τα Smart Checkout κλειδιά είναι έγκυρα.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Αποτυχία επαλήθευσης με τη Viva. Ελέγξτε Client ID, Client Secret και Περιβάλλον.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'info',
        text: 'Δεν ήταν δυνατή η κλήση του server επαλήθευσης σε τοπικό περιβάλλον. Τα στοιχεία σας παραμένουν αποθηκευμένα.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Loader2 className="animate-spin text-cyan-500" size={48} />
      </div>
    );
  }

  // Connected view: shows "Έχει ήδη συνδεθεί"
  if (isConnected && !isEditing) {
    const connectedDate = settings.connected_at
      ? new Date(settings.connected_at).toLocaleString('el-GR', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Green Connected Banner */}
          <div className="bg-green-50 border-b border-green-100 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 size={30} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1">
                  <h2 className="text-2xl font-bold text-green-900">
                    Έχει ήδη συνδεθεί
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span>
                    Viva.com Ενεργό
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      settings.environment === 'live'
                        ? 'bg-slate-900 text-white'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {settings.environment === 'live' ? 'Live (Παραγωγή)' : 'Demo (Δοκιμαστικό)'}
                  </span>
                </div>
                <p className="text-sm text-green-800/80">
                  Ο λογαριασμός Viva.com έχει συνδεθεί με το διαχειριστικό.
                  {connectedDate && ` Συνδέθηκε στις ${connectedDate}.`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white hover:bg-green-100/70 text-green-800 border border-green-200 transition-colors disabled:opacity-60"
              >
                {isTesting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Δοκιμή Σύνδεσης
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusMessage(null);
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-900 hover:bg-cyan-500 text-white transition-colors"
              >
                <Edit2 size={16} />
                Επεξεργασία Στοιχείων
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors disabled:opacity-60"
              >
                <Unlink size={16} />
                Αποσύνδεση
              </button>
            </div>
          </div>

          {/* Feedback Message */}
          {statusMessage && (
            <div
              className={`mx-6 sm:mx-8 mt-6 px-4 py-3 rounded-xl text-sm flex items-start gap-3 border ${
                statusMessage.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : statusMessage.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-sky-50 border-sky-200 text-sky-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
              ) : (
                <Info size={18} className="shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Masked Credentials Summary */}
          <div className="p-6 sm:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Αποθηκευμένα Στοιχεία Σύνδεσης
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">Merchant ID</p>
                <p className="font-mono text-sm text-slate-900 break-all">
                  {maskSecret(settings.merchant_id, 6)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">Source Code (Κωδικός Πηγής)</p>
                <p className="font-mono text-sm font-semibold text-slate-900">
                  {settings.source_code}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">Smart Checkout Client ID</p>
                <p className="font-mono text-sm text-slate-900 break-all">
                  {maskSecret(settings.client_id, 6)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">API Key</p>
                <p className="font-mono text-sm text-slate-900">••••••••••••</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">Smart Checkout Client Secret</p>
                <p className="font-mono text-sm text-slate-900">••••••••••••</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">Webhook Verification Key</p>
                <p className="font-mono text-sm text-slate-900">
                  {settings.webhook_key ? '••••••••••••' : 'Δεν έχει οριστεί'}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <RedirectUrlsBox />
            </div>

            {storageMode === 'local' && (
              <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
                <Info size={18} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold">Τοπική αποθήκευση ενεργή</p>
                  <p className="text-amber-800/90 mt-0.5">
                    Τα στοιχεία αποθηκεύτηκαν στον browser γιατί δεν βρέθηκε ακόμη ο πίνακας{' '}
                    <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">
                      payment_settings
                    </code>{' '}
                    στο Supabase. Τρέξτε το αρχείο{' '}
                    <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">
                      supabase_viva_setup.sql
                    </code>{' '}
                    στο Supabase SQL Editor για μόνιμη αποθήκευση στη βάση.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Setup or Edit Form
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-cyan-400 flex items-center justify-center shrink-0">
              <CreditCard size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isEditing ? 'Επεξεργασία Στοιχείων Viva.com' : 'Σύνδεση με Viva.com (Smart Checkout)'}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Συμπληρώστε τα απαραίτητα κλειδιά API από τον λογαριασμό σας στο Viva.com για να ενεργοποιήσετε τις online πληρωμές.
              </p>
            </div>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto"
            >
              Ακύρωση
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8" autoComplete="off">
          {/* Quick Instructions Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <ShieldCheck size={18} className="text-cyan-600" />
              Πού θα βρείτε τα στοιχεία στο Viva.com Dashboard;
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>Merchant ID &amp; API Key:</strong>{' '}
                <span>Ρυθμίσεις (Settings) → Πρόσβαση API (API Access) → Access Credentials</span>
              </li>
              <li>
                <strong>Client ID &amp; Client Secret:</strong>{' '}
                <span>Ρυθμίσεις (Settings) → Πρόσβαση API (API Access) → Smart Checkout Credentials</span>
              </li>
              <li>
                <strong>Source Code (4-ψήφιος κωδικός):</strong>{' '}
                <span>Πωλήσεις (Sales) → Online Πληρωμές → Ιστοσελίδες/Εφαρμογές</span>
              </li>
            </ul>
          </div>

          <RedirectUrlsBox />

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Environment Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              Περιβάλλον Λειτουργίας *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, environment: 'demo' }))}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  formData.environment === 'demo'
                    ? 'border-cyan-500 bg-cyan-50/40 ring-4 ring-cyan-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900">Demo (Sandbox / Δοκιμαστικό)</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Test
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Χρήση demo.vivapayments.com για δοκιμές χωρίς πραγματικές χρεώσεις.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, environment: 'live' }))}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  formData.environment === 'live'
                    ? 'border-cyan-500 bg-cyan-50/40 ring-4 ring-cyan-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900">Live (Παραγωγή)</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                    Real Payments
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Χρήση vivapayments.com για κανονικές πληρωμές πελατών.
                </p>
              </button>
            </div>
          </div>

          {/* Access Credentials Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              1. Βασικά Στοιχεία Λογαριασμού (Access Credentials)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="viva-merchant-id" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Merchant ID (Κωδικός Εμπόρου) *
                </label>
                <div className="relative">
                  <Building size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="viva-merchant-id"
                    type="text"
                    name="merchant_id"
                    required
                    value={formData.merchant_id}
                    onChange={handleChange}
                    placeholder="π.χ. 12345678-abcd-efgh-ijkl-1234567890ab"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 text-sm font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="viva-api-key" className="block text-sm font-medium text-slate-700 mb-1.5">
                  API Key (Κλειδί API) *
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="viva-api-key"
                    type={showSecrets.api_key ? 'text' : 'password'}
                    name="api_key"
                    required
                    autoComplete="new-password"
                    value={formData.api_key}
                    onChange={handleChange}
                    placeholder="Εισάγετε το Viva API Key"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 text-sm font-mono text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('api_key')}
                    aria-label={showSecrets.api_key ? 'Απόκρυψη API Key' : 'Εμφάνιση API Key'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showSecrets.api_key ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Checkout OAuth2 Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              2. Στοιχεία Smart Checkout (OAuth 2.0)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="viva-client-id" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Client ID *
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="viva-client-id"
                    type="text"
                    name="client_id"
                    required
                    value={formData.client_id}
                    onChange={handleChange}
                    placeholder="π.χ. xxxxxxxxx.apps.vivapayments.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 text-sm font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="viva-client-secret" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Client Secret *
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="viva-client-secret"
                    type={showSecrets.client_secret ? 'text' : 'password'}
                    name="client_secret"
                    required
                    autoComplete="new-password"
                    value={formData.client_secret}
                    onChange={handleChange}
                    placeholder="Εισάγετε το Smart Checkout Client Secret"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 text-sm font-mono text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('client_secret')}
                    aria-label={showSecrets.client_secret ? 'Απόκρυψη Client Secret' : 'Εμφάνιση Client Secret'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showSecrets.client_secret ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Source & Webhook */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              3. Πηγή Πληρωμής &amp; Webhook
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="viva-source-code" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Source Code (Κωδικός Πηγής Πληρωμής) *
                </label>
                <div className="relative">
                  <Hash size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="viva-source-code"
                    type="text"
                    name="source_code"
                    required
                    value={formData.source_code}
                    onChange={handleChange}
                    placeholder="π.χ. 2861"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 text-sm font-mono text-slate-900"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Ο 4-ψήφιος κωδικός της ιστοσελίδας/εφαρμογής σας στο Viva.com.
                </p>
              </div>

              <div>
                <label htmlFor="viva-webhook-key" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Webhook Verification Key (Προαιρετικό)
                </label>
                <div className="relative">
                  <Webhook size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="viva-webhook-key"
                    type={showSecrets.webhook_key ? 'text' : 'password'}
                    name="webhook_key"
                    autoComplete="new-password"
                    value={formData.webhook_key}
                    onChange={handleChange}
                    placeholder="Προαιρετικό κλειδί επαλήθευσης webhook"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 text-sm font-mono text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('webhook_key')}
                    aria-label={showSecrets.webhook_key ? 'Απόκρυψη Webhook Key' : 'Εμφάνιση Webhook Key'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showSecrets.webhook_key ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Για αυτόματη επιβεβαίωση πληρωμών μέσω Viva Webhooks.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Ακύρωση
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-cyan-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Σύνδεση...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  {isEditing ? 'Αποθήκευση & Ενημέρωση' : 'Σύνδεση με Viva'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminVivaSettings;
