// frontend/components/UserProfile.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { authAPI, apiClient } from '../lib/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  bio: string;
  company: string;
  job_title: string;
  location: string;
  interests: string[];
  profile_public: boolean;
  show_location: boolean;
  profile_completion_percentage: number;
  profile?: {
    years_experience: number | null;
    education_level: string;
    certifications: string;
    linkedin_url: string;
    website_url: string;
    email_notifications: boolean;
    weekly_digest: boolean;
  };
}

const USER_TYPES = [
  { value: 'community', label: 'Community Member' },
  { value: 'geologist', label: 'Geologist' },
  { value: 'investor', label: 'Investor' },
  { value: 'student', label: 'Student/Academic' },
];

const EDUCATION_LEVELS = [
  { value: '', label: 'Select education level...' },
  { value: 'high_school', label: 'High School' },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
  { value: 'professional', label: 'Professional Certification' },
];

const INTEREST_OPTIONS = [
  'gold', 'copper', 'silver', 'lithium', 'rare_earths', 'coal', 'iron_ore',
  'exploration', 'mining_engineering', 'geology', 'geophysics', 'data_analysis'
];

export const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authAPI.getCurrentUser();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;
  
  if (type === 'checkbox') {
    const checkbox = e.target as HTMLInputElement;
    setProfile(prev => prev ? {
      ...prev,
      [name]: checkbox.checked
    } : null);
  } else if (name.startsWith('profile.')) {
    const profileField = name.replace('profile.', '');
    setProfile(prev => {
      if (!prev) return null;
      
      let processedValue: any = value;
      
      // Handle different field types
      if (profileField === 'years_experience') {
        processedValue = value === '' ? null : Number(value);
      } else if (profileField === 'email_notifications' || profileField === 'weekly_digest') {
        processedValue = value === 'true';
      } else {
        processedValue = value === '' ? null : value;
      }
      
      return {
        ...prev,
        profile: {
          years_experience: null,
          education_level: '',
          certifications: '',
          linkedin_url: '',
          website_url: '',
          email_notifications: true,
          weekly_digest: false,
          ...prev.profile,
          [profileField]: processedValue
        }
      };
    });
  } else {
    setProfile(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  }

  // Clear errors
  if (errors[name]) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    }
    };  

  const handleInterestChange = (interest: string) => {
    setProfile(prev => {
      if (!prev) return null;
      const currentInterests = prev.interests || [];
      const newInterests = currentInterests.includes(interest)
        ? currentInterests.filter(i => i !== interest)
        : [...currentInterests, interest];
      
      return {
        ...prev,
        interests: newInterests
      };
    });
  };

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile?.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!profile?.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!profile?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (profile?.profile?.linkedin_url && !profile.profile.linkedin_url.startsWith('http')) {
      newErrors['profile.linkedin_url'] = 'Please enter a valid URL';
    }

    if (profile?.profile?.website_url && !profile.profile.website_url.startsWith('http')) {
      newErrors['profile.website_url'] = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!profile || !validateProfile()) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage('');

    try {
      const updatedProfile = await apiClient.post('/auth/profile/', profile);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reload original data
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-red-600">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
              <p className="text-sm text-gray-600 mt-1">
                Profile completion: {profile.profile_completion_percentage || 0}%
              </p>
            </div>
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={profile.first_name || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profile.first_name || 'Not set'}</p>
                )}
                {errors.first_name && <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={profile.last_name || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profile.last_name || 'Not set'}</p>
                )}
                {errors.last_name && <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profile.email}</p>
                )}
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type
                </label>
                {isEditing ? (
                  <select
                    name="user_type"
                    value={profile.user_type || 'community'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {USER_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="py-2 text-gray-900">
                    {USER_TYPES.find(t => t.value === profile.user_type)?.label || profile.user_type}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="company"
                    value={profile.company || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profile.company || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="job_title"
                    value={profile.job_title || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profile.job_title || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={profile.location || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="City, State/Province, Country"
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profile.location || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years Experience
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="profile.years_experience"
                    value={profile.profile?.years_experience || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                ) : (
                  <p className="py-2 text-gray-900">
                    {profile.profile?.years_experience ? `${profile.profile.years_experience} years` : 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                rows={4}
                value={profile.bio || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Tell us about your background in mining/geology"
              />
            ) : (
              <p className="py-2 text-gray-900 whitespace-pre-wrap">{profile.bio || 'Not set'}</p>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests
            </label>
            {isEditing ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {INTEREST_OPTIONS.map(interest => (
                  <label key={interest} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.interests?.includes(interest) || false}
                      onChange={() => handleInterestChange(interest)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{interest.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.interests?.length ? (
                  profile.interests.map(interest => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded capitalize"
                    >
                      {interest.replace('_', ' ')}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No interests selected</p>
                )}
              </div>
            )}
          </div>

          {/* Privacy Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="profile_public"
                  checked={profile.profile_public || false}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Make profile visible to other users</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="show_location"
                  checked={profile.show_location || false}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Show location on profile</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};