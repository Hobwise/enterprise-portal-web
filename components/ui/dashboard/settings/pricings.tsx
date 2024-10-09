import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState('Free');
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);

  const plans = [
    { name: 'Free', price: 0, current: true },
    { name: 'Standard', price: 25000 },
    { name: 'Pro', price: 75000 },
  ];

  const handlePlanChange = (planName: any) => {
    if (planName !== 'Pro' && selectedPlan === 'Pro') {
      setSelectedPlan(planName);
      setShowDowngradeWarning(true);
    } else {
      setSelectedPlan(planName);
      setShowDowngradeWarning(false);
    }
  };

  const handleUpgrade = () => {
    console.log(`Upgrading to ${selectedPlan} plan`);
    // Add actual upgrade logic here
  };
  const componentProps = {
    email: 'damoye81@gmail.com',
    amount: 75000 * 100,
    metadata: {
      name: 'Damilare Oyedeji',
      phone: '07031203859',
    },
    publicKey: '123456',
    text: 'Pay Now',
    onSuccess: () =>
      alert('Thanks for donating to us! we do not take it for granted!!'),
    onClose: () => alert("Wait! You need to donate, don't go!!!!"),
  };
  return (
    <div className='max-w-2xl mx-auto'>
      <h1 className='text-2xl font-bold mb-2'>Select plan</h1>
      <p className='text-foreground-600 mb-4'>
        Simple and flexible per-user pricing.
      </p>

      <div className='grid grid-cols-3 gap-4 mb-6'>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-4 border rounded-lg ${
              selectedPlan === plan.name
                ? 'border-secondary-500 border-2'
                : 'border-foreground-200'
            }`}
          >
            <label className='flex flex-col items-center cursor-pointer'>
              <input
                type='radio'
                name='plan'
                checked={selectedPlan === plan.name}
                onChange={() => handlePlanChange(plan.name)}
                className='sr-only'
              />
              <div className='flex flex-col items-center'>
                <h3 className='text-lg font-semibold'>{plan.name}</h3>
                <p className='text-2xl font-bold'>
                  {formatPrice(plan.price)}
                  <span className='text-sm font-normal'>/month</span>
                </p>
                {plan.current ? (
                  <span
                    className={`mt-2 px-2 py-1 ${
                      selectedPlan === plan.name
                        ? 'bg-secondary-600 text-white'
                        : 'bg-foreground-200 text-foreground-700'
                    }  text-sm rounded`}
                  >
                    {selectedPlan === plan.name ? 'Selected' : 'Current plan'}
                  </span>
                ) : (
                  <button
                    className={`mt-2 px-4 py-2 rounded text-sm ${
                      selectedPlan === plan.name
                        ? 'bg-secondary-600 text-white'
                        : 'bg-foreground-200 text-foreground-700'
                    }`}
                  >
                    {selectedPlan === plan.name ? 'Selected' : 'Select'}
                  </button>
                )}
              </div>
            </label>
          </div>
        ))}
      </div>

      {showDowngradeWarning && (
        <div
          className='bg-primary-100 border-l-4 border-primary-500 text-primary-700 p-4 mb-6'
          role='alert'
        >
          <p>
            Are you sure you want to downgrade? This will remove Pro plan
            privileges, shifting your account to the Free plan on February 1,
            2024.
          </p>
        </div>
      )}

      {/* <button
        className='px-4 py-2 bg-secondary-600 float-right text-white rounded'
        onClick={handleUpgrade}
      >
        Upgrade plan
      </button> */}
      {/* <PaystackButton
        className='px-4 py-2 bg-secondary-600 float-right text-white rounded'
        {...componentProps}
      /> */}
      <p className='text-sm text-secondary-600 mt-4 cursor-pointer'>
        Compare plans and pricing options
      </p>
    </div>
  );
};

export default Pricing;
