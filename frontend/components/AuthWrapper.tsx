// frontend/components/AuthWrapper.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { tokenManager, authAPI } from '../lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  user_type: string;
  profile_completed: boolean;
}

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = tokenManager.getToken();
      
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token is invalid, remove it
          tokenManager.removeToken();
        }
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated, show login/register
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Mining Data Platform
            </h1>
            <p className="text-xl text-gray-600">
              Professional geological data management and analysis
            </p>
          </div>

          {/* Auth Forms */}
          {showRegister ? (
            <RegisterForm 
              onSuccess={handleAuthSuccess}
              onToggleMode={() => setShowRegister(false)}
            />
          ) : (
            <LoginForm 
              onSuccess={handleAuthSuccess}
              onToggleMode={() => setShowRegister(true)}
            />
          )}

          {/* Features Preview */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Platform Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 text-3xl mb-4">⛏️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Data Input
                </h3>
                <p className="text-gray-600">
                  Enter mining properties, drill holes, and geological samples with professional validation
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-green-600 text-3xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Data Analysis
                </h3>
                <p className="text-gray-600">
                  Visualize grade distributions, drill hole logs, and statistical analysis
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-purple-600 text-3xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Collaboration
                </h3>
                <p className="text-gray-600">
                  Share data with team members and collaborate on mining projects
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the main app with navigation
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Mining Platform
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.user_type}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};