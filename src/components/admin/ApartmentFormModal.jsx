import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Plus, Trash2 } from 'lucide-react';

const ApartmentFormModal = ({ isOpen, onClose, onSave, onUploadImages, apartment = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '',
    title_el: '',
    floor_en: '',
    floor_el: '',
    capacity: 2,
    status: 'available',
    amenities_en: [''],
    amenities_el: [''],
    images: []
  });
  
  const [newImages, setNewImages] = useState([]); // File objects
  const [imagePreviews, setImagePreviews] = useState([]); // URLs for preview

  useEffect(() => {
    if (apartment) {
      setFormData({
        title_en: apartment.title_en || '',
        title_el: apartment.title_el || '',
        floor_en: apartment.floor_en || '',
        floor_el: apartment.floor_el || '',
        capacity: apartment.capacity || 2,
        status: apartment.status || 'available',
        amenities_en: apartment.amenities_en?.length ? apartment.amenities_en : [''],
        amenities_el: apartment.amenities_el?.length ? apartment.amenities_el : [''],
        images: apartment.images || []
      });
      setImagePreviews(apartment.images || []);
    } else {
      setFormData({
        title_en: '',
        title_el: '',
        floor_en: '',
        floor_el: '',
        capacity: 2,
        status: 'available',
        amenities_en: [''],
        amenities_el: [''],
        images: []
      });
      setImagePreviews([]);
    }
    setNewImages([]);
  }, [apartment, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    // If it's an existing image (from DB)
    if (index < formData.images.length) {
      const newImagesList = [...formData.images];
      newImagesList.splice(index, 1);
      setFormData(prev => ({ ...prev, images: newImagesList }));
      
      const newPreviews = [...imagePreviews];
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
    } else {
      // If it's a newly added image (not yet uploaded)
      const newImageIndex = index - formData.images.length;
      
      const updatedNewImages = [...newImages];
      updatedNewImages.splice(newImageIndex, 1);
      setNewImages(updatedNewImages);
      
      const newPreviews = [...imagePreviews];
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
    }
  };

  const handleAmenityChange = (lang, index, value) => {
    setFormData(prev => {
      const newAmenities = [...prev[`amenities_${lang}`]];
      newAmenities[index] = value;
      return { ...prev, [`amenities_${lang}`]: newAmenities };
    });
  };

  const addAmenity = (lang) => {
    setFormData(prev => ({
      ...prev,
      [`amenities_${lang}`]: [...prev[`amenities_${lang}`], '']
    }));
  };

  const removeAmenity = (lang, index) => {
    setFormData(prev => {
      const newAmenities = [...prev[`amenities_${lang}`]];
      newAmenities.splice(index, 1);
      return { ...prev, [`amenities_${lang}`]: newAmenities };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImages = [...formData.images];

      // Upload new images if any
      if (newImages.length > 0) {
        const uploadResult = await onUploadImages(newImages);
        if (uploadResult.success) {
          finalImages = [...finalImages, ...uploadResult.urls];
        } else {
          alert('Error uploading images: ' + uploadResult.error);
          setIsSubmitting(false);
          return;
        }
      }

      // Filter out empty amenities
      const filteredAmenitiesEn = formData.amenities_en.filter(a => a.trim() !== '');
      const filteredAmenitiesEl = formData.amenities_el.filter(a => a.trim() !== '');

      const submissionData = {
        ...formData,
        amenities_en: filteredAmenitiesEn,
        amenities_el: filteredAmenitiesEl,
        images: finalImages
      };

      await onSave(submissionData);
    } catch (error) {
      console.error('Error saving apartment:', error);
      alert('Error saving apartment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative my-8">
        
        <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-slate-100 rounded-t-3xl flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {apartment ? 'Edit Apartment' : 'Add New Apartment'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title (English)</label>
              <input 
                type="text" 
                required
                value={formData.title_en}
                onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. Minos 1st Floor"
              />
            </div>

            {/* Greek Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title (Greek)</label>
              <input 
                type="text" 
                required
                value={formData.title_el}
                onChange={(e) => setFormData({...formData, title_el: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="π.χ. Μίνως 1ος Όροφος"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Floor */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Floor & Size Info (English)</label>
              <input 
                type="text" 
                required
                value={formData.floor_en}
                onChange={(e) => setFormData({...formData, floor_en: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 1st Floor • 100 m²"
              />
            </div>

            {/* Greek Floor */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Floor & Size Info (Greek)</label>
              <input 
                type="text" 
                required
                value={formData.floor_el}
                onChange={(e) => setFormData({...formData, floor_el: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="π.χ. 1ος Όροφος • 100 τ.μ."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Capacity (Persons)</label>
              <input 
                type="number" 
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
            {/* English Amenities */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Amenities (English)</label>
                <button type="button" onClick={() => addAmenity('en')} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1">
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {formData.amenities_en.map((amenity, index) => (
                  <div key={`en-${index}`} className="flex gap-2">
                    <input 
                      type="text" 
                      value={amenity}
                      onChange={(e) => handleAmenityChange('en', index, e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g. Sea View, WiFi..."
                    />
                    <button type="button" onClick={() => removeAmenity('en', index)} className="p-2 text-slate-400 hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Greek Amenities */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Amenities (Greek)</label>
                <button type="button" onClick={() => addAmenity('el')} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1">
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {formData.amenities_el.map((amenity, index) => (
                  <div key={`el-${index}`} className="flex gap-2">
                    <input 
                      type="text" 
                      value={amenity}
                      onChange={(e) => handleAmenityChange('el', index, e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="π.χ. Θέα Θάλασσα, WiFi..."
                    />
                    <button type="button" onClick={() => removeAmenity('el', index)} className="p-2 text-slate-400 hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="border-t border-slate-100 pt-8">
            <label className="block text-sm font-medium text-slate-700 mb-4">Apartment Images</label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((url, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <label className="border-2 border-dashed border-slate-300 hover:border-cyan-500 bg-slate-50 hover:bg-cyan-50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors aspect-video">
                <Upload className="text-slate-400 mb-2" size={24} />
                <span className="text-sm font-medium text-slate-500">Add Images</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-slate-500">Upload high-quality images. The first image will be used as the main thumbnail.</p>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-cyan-500 disabled:bg-slate-400 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-sm transform hover:-translate-y-0.5"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Apartment'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ApartmentFormModal;
