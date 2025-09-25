// frontend/components/DrillHoleForm.tsx
'use client';

import { apiClient } from '@/lib/api';
import React, { useState, useEffect } from 'react';

interface Property {
  id: number;
  name: string;
}

interface DrillHoleFormData {
  geo_property: string;
  hole_id: string;
  latitude: string;
  longitude: string;
  elevation: string;
  total_depth: string;
  azimuth: string;
  dip: string;
  drilling_date: string;
}

export const DrillHoleForm: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState<DrillHoleFormData>({
    geo_property: '',
    hole_id: '',
    latitude: '',
    longitude: '',
    elevation: '',
    total_depth: '',
    azimuth: '',
    dip: '',
    drilling_date: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch properties for dropdown
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('Fethching properties...')
        const data = await apiClient.get('/geological/properties/');
        console.log('Properties data: ', data)
        setProperties(data.results || data)
        console.log('Response status: ', data.status)
      } catch (err) {
        console.log('Error fetching properties:', err)
      }         
    };
    fetchProperties();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.geo_property) {
      newErrors.geo_property = 'Property is required';
    }

    if (!formData.hole_id.trim()) {
      newErrors.hole_id = 'Hole ID is required';
    }

    if (!formData.latitude || isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90) {
      newErrors.latitude = 'Valid latitude is required (-90 to 90)';
    }

    if (!formData.longitude || isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180) {
      newErrors.longitude = 'Valid longitude is required (-180 to 180)';
    }

    if (!formData.elevation || isNaN(Number(formData.elevation))) {
      newErrors.elevation = 'Valid elevation is required';
    }

    if (!formData.total_depth || isNaN(Number(formData.total_depth)) || Number(formData.total_depth) <= 0) {
      newErrors.total_depth = 'Total depth must be greater than 0';
    }

    if (!formData.azimuth || isNaN(Number(formData.azimuth)) || Number(formData.azimuth) < 0 || Number(formData.azimuth) > 360) {
      newErrors.azimuth = 'Azimuth must be between 0 and 360 degrees';
    }

    if (!formData.dip || isNaN(Number(formData.dip)) || Number(formData.dip) < -90 || Number(formData.dip) > 90) {
      newErrors.dip = 'Dip must be between -90 and 90 degrees';
    }

    if (!formData.drilling_date) {
      newErrors.drilling_date = 'Drilling date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const submitData = {
        geo_property: parseInt(formData.geo_property),
        hole_id: formData.hole_id,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        elevation: parseFloat(formData.elevation),
        total_depth: parseFloat(formData.total_depth),
        azimuth: parseFloat(formData.azimuth),
        dip: parseFloat(formData.dip),
        drilling_date: formData.drilling_date,
      };
      console.log('Data being sent:', JSON.stringify(submitData, null, 2))
      
      const result = await apiClient.post('/geological/drill-holes/', submitData);

      setSuccessMessage(`Drill hole "${result.hole_id}" created successfully!`);
      
      // Reset form
      setFormData({
        geo_property: '',
        hole_id: '',
        latitude: '',
        longitude: '',
        elevation: '',
        total_depth: '',
        azimuth: '',
        dip: '',
        drilling_date: '',
      });

    } catch (error) {
      console.error('Error creating drill hole:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Drill Hole</h2>
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Selection */}
        <div>
          <label htmlFor="geo_property" className="block text-sm font-medium text-gray-700 mb-1">
            Property *
          </label>
          <select
            id="geo_property"
            name="geo_property"
            value={formData.geo_property}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.geo_property ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a property...</option>
            {properties.map(geo_property => (
              <option key={geo_property.id} value={geo_property.id}>
                {geo_property.name}
              </option>
            ))}
          </select>
          {errors.geo_property && <p className="mt-1 text-sm text-red-600">{errors.geo_property}</p>}
        </div>

        {/* Hole ID */}
        <div>
          <label htmlFor="hole_id" className="block text-sm font-medium text-gray-700 mb-1">
            Hole ID *
          </label>
          <input
            type="text"
            id="hole_id"
            name="hole_id"
            value={formData.hole_id}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.hole_id ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., DDH001, RC001"
          />
          {errors.hole_id && <p className="mt-1 text-sm text-red-600">{errors.hole_id}</p>}
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              type="number"
              step="any"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.latitude ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="-90 to 90"
            />
            {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>}
          </div>

          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              type="number"
              step="any"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.longitude ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="-180 to 180"
            />
            {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>}
          </div>

          <div>
            <label htmlFor="elevation" className="block text-sm font-medium text-gray-700 mb-1">
              Elevation (m) *
            </label>
            <input
              type="number"
              step="any"
              id="elevation"
              name="elevation"
              value={formData.elevation}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.elevation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Elevation above sea level"
            />
            {errors.elevation && <p className="mt-1 text-sm text-red-600">{errors.elevation}</p>}
          </div>
        </div>

        {/* Drilling Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="total_depth" className="block text-sm font-medium text-gray-700 mb-1">
              Total Depth (m) *
            </label>
            <input
              type="number"
              step="any"
              id="total_depth"
              name="total_depth"
              value={formData.total_depth}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.total_depth ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Hole depth"
            />
            {errors.total_depth && <p className="mt-1 text-sm text-red-600">{errors.total_depth}</p>}
          </div>

          <div>
            <label htmlFor="azimuth" className="block text-sm font-medium text-gray-700 mb-1">
              Azimuth (°) *
            </label>
            <input
              type="number"
              step="any"
              id="azimuth"
              name="azimuth"
              value={formData.azimuth}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.azimuth ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0 to 360"
            />
            {errors.azimuth && <p className="mt-1 text-sm text-red-600">{errors.azimuth}</p>}
          </div>

          <div>
            <label htmlFor="dip" className="block text-sm font-medium text-gray-700 mb-1">
              Dip (°) *
            </label>
            <input
              type="number"
              step="any"
              id="dip"
              name="dip"
              value={formData.dip}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.dip ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="-90 to 90"
            />
            {errors.dip && <p className="mt-1 text-sm text-red-600">{errors.dip}</p>}
            <p className="mt-1 text-xs text-gray-500">Negative values = upward drilling</p>
          </div>
        </div>

        {/* Drilling Date */}
        <div>
          <label htmlFor="drilling_date" className="block text-sm font-medium text-gray-700 mb-1">
            Drilling Date *
          </label>
          <input
            type="date"
            id="drilling_date"
            name="drilling_date"
            value={formData.drilling_date}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.drilling_date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.drilling_date && <p className="mt-1 text-sm text-red-600">{errors.drilling_date}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isSubmitting ? 'Creating Drill Hole...' : 'Create Drill Hole'}
        </button>
      </form>
    </div>
  );
};