import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { apartments as fallbackApartments } from '../data/apartments';

// Helper to convert hardcoded apartments to the DB schema format for fallback
const getFallbackData = () => {
  return fallbackApartments.map(apt => ({
    id: apt.id,
    title_en: apt.titleKey, // Keep keys for fallback, though DB uses raw text
    title_el: apt.titleKey,
    floor_en: apt.floorKey,
    floor_el: apt.floorKey,
    capacity: apt.capacity,
    amenities_en: apt.amenitiesKeys,
    amenities_el: apt.amenitiesKeys,
    images: apt.images,
    status: 'available'
  }));
};

export function useApartments() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApartments();
  }, []);

  async function fetchApartments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setApartments(data);
      } else {
        // Fallback to static data if table is empty
        setApartments(getFallbackData());
      }
    } catch (err) {
      console.error('Error fetching apartments:', err);
      // Fallback if supabase fails
      setApartments(getFallbackData());
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addApartment(apartment) {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .insert([apartment])
        .select();

      if (error) throw error;
      if (data) {
        setApartments(prev => [...prev, data[0]]);
      }
      return { success: true };
    } catch (err) {
      console.error('Error adding apartment:', err);
      return { success: false, error: err.message };
    }
  }

  async function updateApartment(id, updates) {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (data) {
        setApartments(prev => prev.map(a => (a.id === id ? data[0] : a)));
      }
      return { success: true };
    } catch (err) {
      console.error('Error updating apartment:', err);
      return { success: false, error: err.message };
    }
  }

  async function deleteApartment(id) {
    try {
      const { error } = await supabase
        .from('apartments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setApartments(prev => prev.filter(a => a.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting apartment:', err);
      return { success: false, error: err.message };
    }
  }

  async function uploadImages(files) {
    try {
      const urls = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('apartment-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('apartment-images')
          .getPublicUrl(filePath);

        urls.push(data.publicUrl);
      }
      return { success: true, urls };
    } catch (err) {
      console.error('Error uploading images:', err);
      return { success: false, error: err.message };
    }
  }

  return {
    apartments,
    loading,
    error,
    addApartment,
    updateApartment,
    deleteApartment,
    uploadImages,
    refreshApartments: fetchApartments
  };
}
