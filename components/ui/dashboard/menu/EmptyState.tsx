import Image from 'next/image';
import NoOrder from '../../../../public/assets/images/no-order.png';

interface EmptyStateProps {
  title: string;
  description: string;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

const EmptyState = ({ title, description, actionButton }: EmptyStateProps) => {
  return (
    <div className='rounded-lg grid place-content-center p-3 py-10 -mt-4'>
      <div className='space-y-5 flex justify-center text-center items-center flex-col max-w-[300px]'>
        <Image
          src={NoOrder}
          width={100}
          height={100}
          className='object-cover rounded-lg'
          aria-label='empty state icon'
          alt='empty state icon'
        />
        <div>
          <h3 className='text-[18px] leading-8 font-semibold'>
            {title}
          </h3>
          <p className='text-sm font-[400] text-grey600'>
            {description}
          </p>
        </div>
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className='text-white bg-primaryColor rounded-lg px-4 py-2'
          >
            {actionButton.text}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;