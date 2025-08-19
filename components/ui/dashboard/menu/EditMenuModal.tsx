import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const EditMenuModal = () => {
  const [formData, setFormData] = useState({
    menuName: '',
    section: 'Restaurant',
    packingCost: '',
    preparationTime: ''
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sections = ['Restaurant', 'Appetizers', 'Main Course', 'Desserts', 'Beverages'];

  const handleInputChange = (
    field: 'menuName' | 'section' | 'packingCost' | 'preparationTime',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSectionSelect = (section: string) => {
    setFormData(prev => ({
      ...prev,
      section: section
    }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = () => {
    console.log('Form data:', formData);
    // Handle form submission here
  };

  return (
    <div className="py-3">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Create new menu</h1>
        <p className="text-gray-500 text-sm">Create new menu and add information</p>
      </div>

      <div className="space-y-5">
        {/* Menu Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Menu name
          </label>
          <input
            type="text"
            placeholder="Enter menu name"
            value={formData.menuName}
            onChange={(e) => handleInputChange('menuName', e.target.value)}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          />
        </div>

        {/* Select Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select section
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex items-center justify-between"
            >
              <span className={formData.section ? 'text-gray-900' : 'text-gray-400'}>
                {formData.section || 'Restaurant'}
              </span>
              <ChevronDown 
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {sections.map((section) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => handleSectionSelect(section)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:bg-gray-50"
                  >
                    {section}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Item Packing Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add item packing cost (optional)
          </label>
          <input
            type="text"
            placeholder="Enter value"
            value={formData.packingCost}
            onChange={(e) => handleInputChange('packingCost', e.target.value)}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          />
        </div>

        {/* Default Preparation Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add default preparation time
          </label>
          <input
            type="text"
            placeholder="Enter value"
            value={formData.preparationTime}
            onChange={(e) => handleInputChange('preparationTime', e.target.value)}
            className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Save new menu
        </button>
      </div>
    </div>
  );
};

export default EditMenuModal;