// components/PlanCard.tsx

import { formatPrice } from '@/lib/utils';

interface PlanCardProps {
  name: string;
  price: number;
  isSelected: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ name, price, isSelected, isCurrent, onSelect }) => {
  return (
    <div
      className={`p-4 border rounded-lg ${
        isSelected ? 'border-secondary-500 border-2' : 'border-foreground-200'
      }`}
    >
      <label className='flex flex-col items-center cursor-pointer'>
        <input
          type='radio'
          name='plan'
          checked={isSelected}
          onChange={onSelect}
          className='sr-only'
        />
        <div className='flex flex-col items-center'>
          <h3 className='text-lg font-semibold'>{name}</h3>
          <p className='text-2xl font-bold'>
            {formatPrice(price)}
            <span className='text-sm font-normal'>/month</span>
          </p>
          {isCurrent ? (
            <span
              className={`mt-2 px-2 py-1 ${
                isSelected ? 'bg-secondary-600 text-white' : 'bg-foreground-200 text-foreground-700'
              } text-sm rounded`}
            >
              {isSelected ? 'Selected' : 'Current plan'}
            </span>
          ) : (
            <button
              className={`mt-2 px-4 py-2 rounded text-sm ${
                isSelected ? 'bg-secondary-600 text-white' : 'bg-foreground-200 text-foreground-700'
              }`}
              onClick={onSelect}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          )}
        </div>
      </label>
    </div>
  );
};

export default PlanCard;
