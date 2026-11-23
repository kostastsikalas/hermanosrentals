import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'hermanos_viva_settings';

export const DEFAULT_VIVA_SETTINGS = {
  provider: 'viva',
  environment: 'demo',
  merchant_id: '',
  api_key: '',
  client_id: '',
  client_secret: '',
  source_code: '',
  webhook_key: '',
  is_connected: false,
  connected_at: null,
  updated_at: null,
};

function readLocalSettings() {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_VIVA_SETTINGS, ...parsed };
  } catch {
    return null;
  }
}

function writeLocalSettings(data) {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not persist Viva settings to localStorage:', err);
  }
}

export function useVivaSettings() {
  const [settings, setSettings] = useState(DEFAULT_VIVA_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storageMode, setStorageMode] = useState('supabase'); // 'supabase' | 'local'
  const [dbNotice, setDbNotice] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('provider', 'viva')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        const merged = { ...DEFAULT_VIVA_SETTINGS, ...data };
        setSettings(merged);
        setStorageMode('supabase');
        setDbNotice(null);
      } else {
        // Table exists, no Viva row yet — check if local fallback has data
        const local = readLocalSettings();
        setSettings(local || DEFAULT_VIVA_SETTINGS);
        setStorageMode('supabase');
        setDbNotice(null);
      }
    } catch (err) {
      console.warn('Falling back to localStorage for Viva settings:', err?.message);
      const local = readLocalSettings();
      setSettings(local || DEFAULT_VIVA_SETTINGS);
      setStorageMode('local');
      setDbNotice(err?.message || 'Supabase table payment_settings is not configured yet.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function saveSettings(formValues) {
    setSaving(true);
    const now = new Date().toISOString();
    const payload = {
      provider: 'viva',
      environment: formValues.environment === 'live' ? 'live' : 'demo',
      merchant_id: (formValues.merchant_id || '').trim(),
      api_key: (formValues.api_key || '').trim(),
      client_id: (formValues.client_id || '').trim(),
      client_secret: (formValues.client_secret || '').trim(),
      source_code: (formValues.source_code || '').trim(),
      webhook_key: (formValues.webhook_key || '').trim(),
      is_connected: true,
      connected_at: settings.connected_at || now,
      updated_at: now,
    };

    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .upsert(payload, { onConflict: 'provider' })
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }

      const saved = { ...DEFAULT_VIVA_SETTINGS, ...(data || payload) };
      setSettings(saved);
      writeLocalSettings(saved);
      setStorageMode('supabase');
      setDbNotice(null);
      return { success: true, storageMode: 'supabase', data: saved };
    } catch (err) {
      console.warn('Saving Viva settings locally because Supabase upsert failed:', err?.message);
      setSettings(payload);
      writeLocalSettings(payload);
      setStorageMode('local');
      setDbNotice(err?.message || 'Saved locally.');
      return { success: true, storageMode: 'local', data: payload, dbWarning: err?.message };
    } finally {
      setSaving(false);
    }
  }

  async function disconnectViva() {
    setSaving(true);
    const now = new Date().toISOString();
    const resetPayload = {
      ...DEFAULT_VIVA_SETTINGS,
      is_connected: false,
      connected_at: null,
      updated_at: now,
    };

    try {
      const { error } = await supabase
        .from('payment_settings')
        .upsert(resetPayload, { onConflict: 'provider' });

      if (error) {
        throw error;
      }

      setSettings(resetPayload);
      writeLocalSettings(resetPayload);
      setStorageMode('supabase');
      setDbNotice(null);
      return { success: true };
    } catch (err) {
      console.warn('Disconnecting Viva locally:', err?.message);
      setSettings(resetPayload);
      writeLocalSettings(resetPayload);
      setStorageMode('local');
      setDbNotice(err?.message || null);
      return { success: true, dbWarning: err?.message };
    } finally {
      setSaving(false);
    }
  }

  const isConnected = Boolean(
    settings?.is_connected &&
      settings?.merchant_id &&
      settings?.api_key &&
      settings?.client_id &&
      settings?.client_secret &&
      settings?.source_code
  );

  return {
    settings,
    isConnected,
    loading,
    saving,
    storageMode,
    dbNotice,
    saveSettings,
    disconnectViva,
    refreshSettings: fetchSettings,
  };
}
