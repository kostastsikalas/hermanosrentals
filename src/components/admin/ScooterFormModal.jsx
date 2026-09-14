import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

const ScooterFormModal = ({ isOpen, onClose, onSave, onUploadImage, scooter = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cc: '',
    price: '',
    image: '',
    status: 'available', // available or on_request
    features: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (scooter) {
      setFormData({
        name: scooter.name || '',
        category: scooter.category || '',
        cc: scooter.cc || '',
        price: scooter.price || '',
        image: scooter.image || '',
        status: scooter.status || 'available',
        features: Array.isArray(scooter.features) ? scooter.features.join(', ') : ''
      });
    } else {
      setFormData({
        name: '',
        category: '',
        cc: '',
        price: '',
        image: '',
        status: 'available',
        features: ''
      });
    }
    setUploadError('');
    setIsUploading(false);
  }, [scooter, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      
      const result = await onUploadImage(file);
      
      if (result.success) {
        setFormData(prev => ({ ...prev, image: result.url }));
      } else {
        setUploadError(result.error || 'Failed to upload image.');
      }
    } catch (err) {
      setUploadError('An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      setUploadError('Please upload an image for the scooter.');
      return;
    }

    const processedFeatures = formData.features
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const scooterData = {
      name: formData.name,
      category: formData.category,
      cc: parseInt(formData.cc, 10),
      price: parseFloat(formData.price),
      image: formData.image,
      status: formData.status,
      features: processedFeatures
    };

    onSave(scooterData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {scooter ? 'Edit Scooter' : 'Add New Scooter'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Scooter Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50 transition-colors relative overflow-hidden group">
                {formData.image && !isUploading ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium flex items-center gap-2">
                        <Upload size={18} /> Change Image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-center py-8">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3 text-cyan-600">
                        <Loader2 className="animate-spin" size={32} />
                        <span className="text-sm font-medium">Uploading image...</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600 justify-center">
                          <span className="relative cursor-pointer bg-white rounded-md font-medium text-cyan-600 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500">
                            Upload a file
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG, WebP up to 5MB</p>
                      </>
                    )}
                  </div>
                )}
                
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
              {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Scooter Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white transition-colors"
                  placeholder="e.g. SYM Symphony SR"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <input 
                  type="text" 
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white transition-colors"
                  placeholder="e.g. 125cc"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Engine CC</label>
                <input 
                  type="number" 
                  name="cc"
                  required
                  value={formData.cc}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white transition-colors"
                  placeholder="e.g. 125"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price per Day (€)</label>
                <input 
                  type="number" 
                  name="price"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white transition-colors"
                  placeholder="e.g. 25.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white transition-colors"
                >
                  <option value="available">Available</option>
                  <option value="on_request">On Request</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Features (Comma Separated)</label>
              <textarea 
                name="features"
                required
                value={formData.features}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 focus:bg-white transition-colors resize-none"
                placeholder="2 Helmets included, Top Case, Unlimited Mileage"
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-6 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isUploading}
                className="px-6 py-3 rounded-xl font-medium text-white bg-slate-900 hover:bg-cyan-500 transition-colors shadow-md disabled:opacity-50"
              >
                {scooter ? 'Save Changes' : 'Create Scooter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScooterFormModal;
