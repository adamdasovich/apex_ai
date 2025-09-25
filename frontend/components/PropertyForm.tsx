// frontend/components/PropertyForm.tsx
'use client';

import React, { useState } from 'react';
import { apiClient } from '../lib/api'

interface PropertyFormData {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  area_hectares: string;
  commodity_focus: string[];
  geological_setting: string;
  access_road: boolean;
  power_available: boolean;
  exploration_stage: string;
}

const EXPLORATION_STAGES = [
  { value: 'grassroots', label: 'Grassroots' },
  { value: 'early', label: 'Early Stage' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'resource', label: 'Resource Definition' },
  { value: 'feasibility', label: 'Feasibility' },
  { value: 'development', label: 'Development' },
  { value: 'production', label: 'Production' },
];

const COMMODITY_OPTIONS = [
  'gold', 'copper', 'silver', 'lithium', 'rare_earths', 'coal', 'iron_ore'
];

export const PropertyForm: React.FC = () => {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    area_hectares: '',
    commodity_focus: [],
    geological_setting: '',
    access_road: false,
    power_available: false,
    exploration_stage: 'grassroots',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCommodityChange = (commodity: string) => {
    setFormData(prev => ({
      ...prev,
      commodity_focus: prev.commodity_focus.includes(commodity)
        ? prev.commodity_focus.filter(c => c !== commodity)
        : [...prev.commodity_focus, commodity]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.latitude && (isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (formData.longitude && (isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    if (!formData.area_hectares || isNaN(Number(formData.area_hectares)) || Number(formData.area_hectares) <= 0) {
      newErrors.area_hectares = 'Area must be a positive number';
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
      // Convert string numbers to actual numbers for API
      const submitData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        area_hectares: parseFloat(formData.area_hectares),
      };

      const result = await apiClient.post('/geological/properties/', submitData);

      setSuccessMessage(`Property "${result.name}" created successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        area_hectares: '',
        commodity_focus: [],
        geological_setting: '',
        access_road: false,
        power_available: false,
        exploration_stage: 'grassroots',
      });

    } catch (error) {
      console.error('Error creating property:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Mining Property</h2>
      
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
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Property Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter property name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="exploration_stage" className="block text-sm font-medium text-gray-700 mb-1">
              Exploration Stage
            </label>
            <select
              id="exploration_stage"
              name="exploration_stage"
              value={formData.exploration_stage}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {EXPLORATION_STAGES.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the mining property..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
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
              Longitude
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
            <label htmlFor="area_hectares" className="block text-sm font-medium text-gray-700 mb-1">
              Area (hectares) *
            </label>
            <input
              type="number"
              step="any"
              id="area_hectares"
              name="area_hectares"
              value={formData.area_hectares}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.area_hectares ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Property area"
            />
            {errors.area_hectares && <p className="mt-1 text-sm text-red-600">{errors.area_hectares}</p>}
          </div>
        </div>

        {/* Commodities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commodity Focus
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {COMMODITY_OPTIONS.map(commodity => (
              <label key={commodity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.commodity_focus.includes(commodity)}
                  onChange={() => handleCommodityChange(commodity)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 capitalize">{commodity.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="geological_setting" className="block text-sm font-medium text-gray-700 mb-1">
            Geological Setting
          </label>
          <textarea
            id="geological_setting"
            name="geological_setting"
            rows={2}
            value={formData.geological_setting}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the geological setting..."
          />
        </div>

        {/* Infrastructure */}
        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="access_road"
              checked={formData.access_road}
              onChange={handleInputChange}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Access Road Available</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="power_available"
              checked={formData.power_available}
              onChange={handleInputChange}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Power Available</span>
          </label>
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
          {isSubmitting ? 'Creating Property...' : 'Create Property'}
        </button>
      </form>
    </div>
  );
};