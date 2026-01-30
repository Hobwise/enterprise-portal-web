'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface CustomizedItem {
  id: string;
  initials: string;
  name: string;
  portionSize: string;
  servingInfo: string;
  color: string;
}

export default function MeasurementCustomizationPage() {
  // Form state
  const [selectedMenuItem, setSelectedMenuItem] = useState('asun_jollof');
  const [customServingUnit, setCustomServingUnit] = useState('Portion');
  const [customServingQty, setCustomServingQty] = useState('1');
  const [standardUnit, setStandardUnit] = useState('weight_kg');
  const [standardUnitQty, setStandardUnitQty] = useState('1');
  const [preparationMode, setPreparationMode] = useState('batch_preparation');
  const [qtyPerBatch, setQtyPerBatch] = useState('5');
  const [batchUnit, setBatchUnit] = useState('kg');
  const [servingsPerBatch, setServingsPerBatch] = useState('30');

  // Sample customized items list
  const [customizedItems] = useState<CustomizedItem[]>([
    {
      id: '1',
      initials: 'YE',
      name: 'Yam and Egg Sauce',
      portionSize: '1 portion = 0.25Kg',
      servingInfo: 'Single Plate (0.15kg) = 1 portions',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: '2',
      initials: 'FS',
      name: 'Stir Fried Spaghetti',
      portionSize: '1 portion = 0.25Kg',
      servingInfo: '1 Batch (5kg) = 30 portions',
      color: 'bg-purple-100 text-purple-600',
    },
  ]);

  // Sample menu items for dropdown
  const menuItems = [
    { value: 'asun_jollof', label: 'Asun Jollof Rice' },
    { value: 'fried_rice', label: 'Fried Rice' },
    { value: 'jollof_rice', label: 'Jollof Rice' },
  ];

  const standardUnits = [
    { value: 'weight_kg', label: 'Weight (Kilogram)' },
    { value: 'weight_g', label: 'Weight (Gram)' },
    { value: 'volume_l', label: 'Volume (Liters)' },
    { value: 'volume_ml', label: 'Volume (Milliliters)' },
    { value: 'count', label: 'Count (Pieces)' },
  ];

  const preparationModes = [
    { value: 'batch_preparation', label: 'Batch preparation' },
    { value: 'single_serving', label: 'Single serving' },
    { value: 'made_to_order', label: 'Made to order' },
  ];

  const units = [
    { value: 'kg', label: 'Kg' },
    { value: 'g', label: 'g' },
    { value: 'l', label: 'L' },
    { value: 'ml', label: 'ml' },
  ];

  const handleCustomize = () => {
    console.log({
      selectedMenuItem,
      customServingUnit,
      customServingQty,
      standardUnit,
      standardUnitQty,
      preparationMode,
      qtyPerBatch,
      batchUnit,
      servingsPerBatch,
    });
  };

  return (
    <div className="min-h-screen font-satoshi bg-[#F8F7FC]">
      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#111] mb-3">
            Measurement Customization
          </h1>
          <p className="text-gray-500">
            Customize how portions like spoon, scoop, cup, or plate relate to
            <br />
            standard weight, volume and counts measurements.
          </p>
        </div>

        {/* White Form Container */}
        <div className="">
          {/* Quick Customize Section - lavender inside */}
          <div className="bg-white rounded-xl p-5 mb-6">
            {/* Quick Customize Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-[#EDE8FF] rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#5F35D2]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 italic">
                  Quick Customize
                </h2>
                <p className="text-gray-500 text-sm">
                  Select and add units of menu items
                </p>
              </div>
            </div>

            {/* Menu Item Dropdown */}
            <div className="relative">
              <select
                value={selectedMenuItem}
                onChange={(e) => setSelectedMenuItem(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-[#F3F0FF]"
              >
                <option value="">Select menu item</option>
                {menuItems.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Custom Serving Unit & Standard Unit Row */}
          <div className="grid bg-white grid-cols-2 gap-4 mb-4">
            {/* Custom Serving Unit Box */}
            <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-2">
                  Custom Serving Unit
                </label>
                <input
                  type="text"
                  value={customServingUnit}
                  onChange={(e) => setCustomServingUnit(e.target.value)}
                  placeholder="Portion"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 text-sm"
                />
              </div>
              <div className="w-16">
                <label className="block text-xs text-gray-500 mb-2">Qty</label>
                <input
                  type="number"
                  value={customServingQty}
                  onChange={(e) => setCustomServingQty(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 text-sm text-center"
                />
              </div>
            </div>
          </div>

          {/* Standard Unit Box */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-2">
                  Select Standard Unit
                </label>
                <div className="relative">
                  <select
                    value={standardUnit}
                    onChange={(e) => setStandardUnit(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white text-sm"
                  >
                    <option value="">Select unit</option>
                    {standardUnits.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="w-16">
                <label className="block text-xs text-gray-500 mb-2">Qty</label>
                <input
                  type="number"
                  value={standardUnitQty}
                  onChange={(e) => setStandardUnitQty(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 text-sm text-center"
                />
              </div>
            </div>
          </div>
          </div>

          {/* Preparation Mode Section */}
          <div className="border border-gray-200 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-4 gap-3">
            {/* Preparation Mode */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Preparation Mode
              </label>
              <div className="relative">
                <select
                  value={preparationMode}
                  onChange={(e) => setPreparationMode(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white text-sm"
                >
                  <option value="">Select mode</option>
                  {preparationModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Qty/Batch */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Qty/Batch
              </label>
              <input
                type="number"
                value={qtyPerBatch}
                onChange={(e) => setQtyPerBatch(e.target.value)}
                placeholder="5"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 text-sm"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">Unit</label>
              <div className="relative">
                <select
                  value={batchUnit}
                  onChange={(e) => setBatchUnit(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white text-sm"
                >
                  <option value="">Unit</option>
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Servings/Batch */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Servings/Batch
              </label>
              <input
                type="number"
                value={servingsPerBatch}
                onChange={(e) => setServingsPerBatch(e.target.value)}
                placeholder="30"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 text-sm"
              />
            </div>
            </div>
          </div>

          {/* Customize Button */}
          <button
            onClick={handleCustomize}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-medium transition-all duration-200"
          >
            <span>Customize</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Customized List */}
      </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
          <h2 className="text-2xl font-bold text-[#5F35D2] italic mb-2">
            Customized List
          </h2>
          <div className="border-b border-gray-100 mb-4" />

          <div className="space-y-1">
            {customizedItems.map((item) => (
              <div
                key={item.id} 
                className="flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm ${item.color}`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-0.5">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span>{item.portionSize}</span>
                      <span>{item.servingInfo}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-[#5F35D2] transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
