import React from 'react';

const NoSubscriptionCard = () => {
  return (
    <div className="border border-secondaryGrey w-full rounded-lg my-6">
      <div className="p-4 px-6 border-secondaryGrey">
        <h1 className="text-xl font-bold">No subscription</h1>
        <p className="text-primaryColor font-medium text-sm">Subscribe now</p>
      </div>
    </div>
  );
};

export default NoSubscriptionCard;
