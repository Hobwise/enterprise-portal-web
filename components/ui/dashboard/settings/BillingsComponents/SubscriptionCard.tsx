// components/SubscriptionCard.tsx

import React from 'react';

export const SubscriptionCard: React.FC = () => {
  return (
    <div className="border border-secondaryGrey w-full rounded-lg">
      <div className="p-4 px-6 border-b border-secondaryGrey">
        <h1 className="text-xl font-bold">No subscription</h1>
        <p>Subscribe now</p>
      </div>
      <div className="p-4 px-6">
        <button className="border-2 border-secondary-500 rounded-lg px-6 py-2 font-bold text-secondary-500 hover:bg-secondary-500 hover:text-white">
          Upgrade plan
        </button>
      </div>
    </div>
  );
};

