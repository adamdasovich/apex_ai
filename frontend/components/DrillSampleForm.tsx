// frontend/components/DrillSampleForm.tsx
'use client';

import { apiClient } from '@/lib/api';
import React, { useState, useEffect } from 'react';

interface Property {
  id: number;
  name: string;
}

interface DrillHole {
  id: number;
  hole_id: string;
  geo_property_name: string;
}

interface DrillSampleFormData {
  drill_hole: string;
  from_depth: string;
  to_depth: string;
  gold_grade: string;
  silver_grade: string;
  copper_grade: string;
  rock_type: string;
  alteration: string;
  mineralization: string;
}

const ROCK_TYPES = [
  { value: 'igneous', label: 'Igneous' },
  { value: 'sedimentary', label: 'Sedimentary' },
  { value: 'metamorphic', label: 'Metamorphic' },
  { value: 'volcanic', label: 'Volcanic' },
  { value: 'intrusive', label: 'Intrusive' },
  { value: 'other', label: 'Other' },
];

export const DrillSampleForm: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [drillHoles, setDrillHoles] = useState<DrillHole[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [formData, setFormData] = useState<DrillSampleFormData>({
    drill_hole: '',
    from_depth: '',
    to_depth: '',
    gold_grade: '',
    silver_grade: '',
    copper_grade: '',
    rock_type: 'other',
    alteration: '',
    mineralization: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await apiClient.get('/geological/properties/');        
        setProperties(data.results || data)
       
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

  // Fetch drill holes when property is selected
  useEffect(() => {
    const fetchDrillHoles = async () => {
      if (!selectedProperty) {
        setDrillHoles([]);
        return;
      }

      try {
        const data = await apiClient.get(`/geological/drill-holes/?geo_property=${selectedProperty}`);
        setDrillHoles(data.results || data)
      } catch (error) {
        console.error('Error fetching drill holes:', error);
      }
    };

    fetchDrillHoles();
  }, [selectedProperty]);

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const geo_propertyId = e.target.value;
    setSelectedProperty(geo_propertyId);
    setFormData(prev => ({ ...prev, drill_hole: '' })); // Reset drill hole selection
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    if (!formData.drill_hole) {
      newErrors.drill_hole = 'Drill hole is required';
    }

    if (!formData.from_depth || isNaN(Number(formData.from_depth)) || Number(formData.from_depth) < 0) {
      newErrors.from_depth = 'From depth must be a non-negative number';
    }

    if (!formData.to_depth || isNaN(Number(formData.to_depth)) || Number(formData.to_depth) < 0) {
      newErrors.to_depth = 'To depth must be a non-negative number';
    }

    if (formData.from_depth && formData.to_depth && Number(formData.to_depth) <= Number(formData.from_depth)) {
      newErrors.to_depth = 'To depth must be greater than from depth';
    }

    // Validate grades (optional but must be positive if provided)
    if (formData.gold_grade && (isNaN(Number(formData.gold_grade)) || Number(formData.gold_grade) < 0)) {
      newErrors.gold_grade = 'Gold grade must be a positive number';
    }

    if (formData.silver_grade && (isNaN(Number(formData.silver_grade)) || Number(formData.silver_grade) < 0)) {
      newErrors.silver_grade = 'Silver grade must be a positive number';
    }

    if (formData.copper_grade && (isNaN(Number(formData.copper_grade)) || Number(formData.copper_grade) < 0 || Number(formData.copper_grade) > 100)) {
      newErrors.copper_grade = 'Copper grade must be between 0 and 100%';
    }

    if (!formData.rock_type) {
      newErrors.rock_type = 'Rock type is required';
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
        drill_hole: parseInt(formData.drill_hole),
        from_depth: parseFloat(formData.from_depth),
        to_depth: parseFloat(formData.to_depth),
        gold_grade: formData.gold_grade ? parseFloat(formData.gold_grade) : null,
        silver_grade: formData.silver_grade ? parseFloat(formData.silver_grade) : null,
        copper_grade: formData.copper_grade ? parseFloat(formData.copper_grade) : null,
        rock_type: formData.rock_type,
        alteration: formData.alteration,
        mineralization: formData.mineralization,
      };
      console.log('Data being sent: ', JSON.stringify(submitData, null, 2))
      const result = await apiClient.post('/geological/drill-samples/', submitData)

    
      const selectedDrillHole = drillHoles.find(dh => dh.id === parseInt(formData.drill_hole));
      setSuccessMessage(`Sample ${formData.from_depth}-${formData.to_depth}m added to ${selectedDrillHole?.hole_id}!`);
      
      // Reset form but keep drill hole selected for easier batch entry
      setFormData(prev => ({
        ...prev,
        from_depth: '',
        to_depth: '',
        gold_grade: '',
        silver_grade: '',
        copper_grade: '',
        rock_type: 'other',
        alteration: '',
        mineralization: '',
      }));

    } catch (error) {
      console.error('Error creating drill sample:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Drill Sample</h2>
      
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
        {/* Property and Drill Hole Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="geo_property" className="block text-sm font-medium text-gray-700 mb-1">
              Property *
            </label>
            <select
              id="geo_property"
              name="geo_property"
              value={selectedProperty}
              onChange={handlePropertyChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a property...</option>
              {properties.map(geo_property => (
                <option key={geo_property.id} value={geo_property.id}>
                  {geo_property.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="drill_hole" className="block text-sm font-medium text-gray-700 mb-1">
              Drill Hole *
            </label>
            <select
              id="drill_hole"
              name="drill_hole"
              value={formData.drill_hole}
              onChange={handleInputChange}
              disabled={!selectedProperty}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.drill_hole ? 'border-red-500' : 'border-gray-300'
              } ${!selectedProperty ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select a drill hole...</option>
              {drillHoles.map(drillHole => (
                <option key={drillHole.id} value={drillHole.id}>
                  {drillHole.hole_id}
                </option>
              ))}
            </select>
            {errors.drill_hole && <p className="mt-1 text-sm text-red-600">{errors.drill_hole}</p>}
          </div>
        </div>

        {/* Sample Interval */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="from_depth" className="block text-sm font-medium text-gray-700 mb-1">
              From Depth (m) *
            </label>
            <input
              type="number"
              step="0.1"
              id="from_depth"
              name="from_depth"
              value={formData.from_depth}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.from_depth ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Start depth"
            />
            {errors.from_depth && <p className="mt-1 text-sm text-red-600">{errors.from_depth}</p>}
          </div>

          <div>
            <label htmlFor="to_depth" className="block text-sm font-medium text-gray-700 mb-1">
              To Depth (m) *
            </label>
            <input
              type="number"
              step="0.1"
              id="to_depth"
              name="to_depth"
              value={formData.to_depth}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.to_depth ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="End depth"
            />
            {errors.to_depth && <p className="mt-1 text-sm text-red-600">{errors.to_depth}</p>}
          </div>
        </div>

        {/* Assay Results */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Assay Results (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="gold_grade" className="block text-sm font-medium text-gray-700 mb-1">
                Gold (g/t)
              </label>
              <input
                type="number"
                step="0.01"
                id="gold_grade"
                name="gold_grade"
                value={formData.gold_grade}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.gold_grade ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.gold_grade && <p className="mt-1 text-sm text-red-600">{errors.gold_grade}</p>}
            </div>

            <div>
              <label htmlFor="silver_grade" className="block text-sm font-medium text-gray-700 mb-1">
                Silver (g/t)
              </label>
              <input
                type="number"
                step="0.1"
                id="silver_grade"
                name="silver_grade"
                value={formData.silver_grade}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.silver_grade ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.0"
              />
              {errors.silver_grade && <p className="mt-1 text-sm text-red-600">{errors.silver_grade}</p>}
            </div>

            <div>
              <label htmlFor="copper_grade" className="block text-sm font-medium text-gray-700 mb-1">
                Copper (%)
              </label>
              <input
                type="number"
                step="0.01"
                id="copper_grade"
                name="copper_grade"
                value={formData.copper_grade}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.copper_grade ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.copper_grade && <p className="mt-1 text-sm text-red-600">{errors.copper_grade}</p>}
            </div>
          </div>
        </div>

        {/* Rock Description */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Geological Description</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="rock_type" className="block text-sm font-medium text-gray-700 mb-1">
                Rock Type *
              </label>
              <select
                id="rock_type"
                name="rock_type"
                value={formData.rock_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.rock_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {ROCK_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.rock_type && <p className="mt-1 text-sm text-red-600">{errors.rock_type}</p>}
            </div>

            <div>
              <label htmlFor="alteration" className="block text-sm font-medium text-gray-700 mb-1">
                Alteration
              </label>
              <input
                type="text"
                id="alteration"
                name="alteration"
                value={formData.alteration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., sericitic, argillic, propylitic"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mineralization" className="block text-sm font-medium text-gray-700 mb-1">
              Mineralization
            </label>
            <textarea
              id="mineralization"
              name="mineralization"
              rows={3}
              value={formData.mineralization}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe visible mineralization, veining, sulfides, etc."
            />
          </div>
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
          {isSubmitting ? 'Adding Sample...' : 'Add Drill Sample'}
        </button>
      </form>
    </div>
  );
};