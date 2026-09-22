import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { scooters as fallbackScooters } from '../data/scooters';

export function useScooters() {
  const [scooters, setScooters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScooters();
  }, []);

  async function fetchScooters() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scooters')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setScooters(data);
      } else {
        // Fallback to static data if table is empty or error
        setScooters(fallbackScooters);
      }
    } catch (err) {
      console.error('Error fetching scooters:', err);
      // Fallback if supabase fails (e.g. not configured yet)
      setScooters(fallbackScooters);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addScooter(scooter) {
    try {
      const { data, error } = await supabase
        .from('scooters')
        .insert([scooter])
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        setScooters(prev => [...prev, data[0]]);
      } else {
        fetchScooters();
      }
      return { success: true };
    } catch (err) {
      console.error('Error adding scooter:', err);
      return { success: false, error: err.message };
    }
  }

  async function updateScooter(id, updates) {
    try {
      const { data, error } = await supabase
        .from('scooters')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        setScooters(prev => prev.map(s => (s?.id === id ? data[0] : s)));
      } else {
        fetchScooters();
      }
      return { success: true };
    } catch (err) {
      console.error('Error updating scooter:', err);
      return { success: false, error: err.message };
    }
  }

  async function deleteScooter(id) {
    try {
      const { error } = await supabase
        .from('scooters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setScooters(prev => prev.filter(s => s.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting scooter:', err);
      return { success: false, error: err.message };
    }
  }

  async function uploadImage(file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('scooter-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('scooter-images')
        .getPublicUrl(filePath);

      return { success: true, url: data.publicUrl };
    } catch (err) {
      console.error('Error uploading image:', err);
      return { success: false, error: err.message };
    }
  }

  return {
    scooters,
    loading,
    error,
    addScooter,
    updateScooter,
    deleteScooter,
    uploadImage,
    refreshScooters: fetchScooters
  };
}
