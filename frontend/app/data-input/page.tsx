'use client'

import React, { useState } from "react"
import { PropertyForm } from '../../components/PropertyForm'
import { DrillHoleForm } from '../../components/DrillHoleForm'
import { DrillSampleForm } from '../../components/DrillSampleForm'
import { AuthWrapper } from "../../components/AuthWrapper"

type FormType = 'property' | 'drill-hole' | 'drill-sample' | null

export default function DataInputPage () {
    const [activeForm, setActiveForm] = useState<FormType>(null)

    const formOptions = [
        {
            id: 'property' as FormType,
            title: 'Add Mining Property',
            description: 'Create a new mining property record',
            icon: '🏔️',
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            id: 'drill-hole' as FormType,
            title: 'Add Drill Hole',
            description: 'Record a new drill hole for an existing property',
            icon: '🔨',
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            id: 'drill-sample' as FormType,
            title: 'Add Drill Sample',
            description: 'Enter geological sample data and assay result',
            icon: '',
            color: 'bg-pink-500 hover:bg-pink-600'
        }
    ]

    const renderActiveForm = () => {
        switch (activeForm) {
            case 'property':
                return <PropertyForm />
            case 'drill-hole':
                return <DrillHoleForm />
            case 'drill-sample':
                return <DrillSampleForm />
            default:
                return null;
        }
    }

    if (activeForm) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-o4xl mx-auto px-4">

                    {/* Back Navigation */}
                    <div className="mb-6">
                        <button
                            onClick={() => setActiveForm(null)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            ← Back to Data Input Menu
                        </button>
                    </div>
                    {renderActiveForm()}
                </div>
            </div>
        )
    }
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50">
            {/*Header */}
            <div className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Geological</h1>
                    <p className="mt-2 text-gray-600">
                        Add mining properties, drill holes, and geological samples to your database
                    </p>
                </div>
            </div>
            {/* Form Selection Cards */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => setActiveForm(option.id)}
            >
              <div className="p-6">
                <div className={`inline-flex items-center justify-center p-3 ${option.color} rounded-lg text-white text-2xl mb-4`}>
                  {option.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {option.description}
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Click to start
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Guide */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Data Input Guide</h2>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <span className="inline-block w-6 h-6 bg-blue-500 text-white rounded-full text-xs leading-6 text-center font-bold mr-3 mt-0.5">1</span>
              <div>
                <strong>Start with Properties:</strong> Create mining property records first. These serve as containers for all geological data.
              </div>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-6 h-6 bg-green-500 text-white rounded-full text-xs leading-6 text-center font-bold mr-3 mt-0.5">2</span>
              <div>
                <strong>Add Drill Holes:</strong> Create drill hole records for each property. Include accurate coordinates and drilling parameters.
              </div>
            </div>
            <div className="flex items-start">
              <span className="inline-block w-6 h-6 bg-purple-500 text-white rounded-full text-xs leading-6 text-center font-bold mr-3 mt-0.5">3</span>
              <div>
                <strong>Enter Sample Data:</strong> Add geological samples with assay results. Each sample represents an interval within a drill hole.
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-md font-semibold text-yellow-900 mb-2">💡 Tips for Data Entry</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use consistent naming conventions for hole IDs (e.g., DDH001, RC001)</li>
            <li>• Ensure coordinates are in decimal degrees format</li>
            <li>• Grade values should be in standard units (g/t for precious metals, % for base metals)</li>
            <li>• Sample intervals should not overlap within the same drill hole</li>
            <li>• Include as much geological description as possible for better analysis</li>
          </ul>
        </div>
      </div>
    </div> 
    </AuthWrapper>       
    )
}