'use client'

import React, { useState } from 'react'
import { authAPI } from '../lib/api'

interface LoginFormProps {
    onSuccess: (user: any) => void;
    onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onToggleMode}) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setFormData(prev => ({ ...prev, [name]: value}))
        if (error) setError('');
    }

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault()
        if(!formData.username.trim() || !formData.password.trim()) {
            setError('Please fill in all fields')
            return;
        }
        setIsSubmitting(true)
        setError('');

        try {
            const result = await authAPI.login(formData.username, formData.password)
            onSuccess(result.user)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Login failed')

        } finally {
            setIsSubmitting(false)
        }
    }
    return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username or Email
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your username or email"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
            disabled={isSubmitting}
          />
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
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onToggleMode}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}