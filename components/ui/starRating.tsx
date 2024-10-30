'use client';

import { cn } from '@/lib/utils';
import { Star } from '@/public/assets/svg';

interface IStarRating {
  size: string;
  handleChange?: (arg: string) => void;
}

const StarRating = ({ size, handleChange }: IStarRating) => {
  return (
    <div className="flex space-x-1 items-center text-sm">
      {[...Array(5)].map((_, star) => {
        const isFullStar = Number(star + 1) <= Math.floor(Number(size));
        const isHalfStar = !isFullStar && Number(star + 1) - Number(size) <= 0.5;

        return (
          <Star
            key={star}
            fill={isFullStar ? '#F79E1B' : isHalfStar ? 'url(#halfStarGradient)' : 'white'}
            color="#F79E1B"
            onClick={() => (handleChange ? handleChange((Number(star) + 1).toString()) : null)}
            onKeyDown={() => (handleChange ? handleChange((Number(star) + 1).toString()) : null)}
            strokeWidth={size && star ? 1 : 0}
            className={cn('cursor-pointer', isFullStar ? 'text-[#F79E1B]' : isHalfStar ? 'url(#halfStarGradient)' : 'text-[#949CA9]')}
          />
        );
      })}

      <svg width="0" height="0">
        <linearGradient id="halfStarGradient">
          <stop offset="50%" stopColor="#F79E1B" />
          <stop offset="50%" stopColor="white" />
        </linearGradient>
      </svg>
      <p className="text-[#9C9C9C] font-light ml-1">
        ({size}
        {size.length > 1 ? '' : '.0'})
      </p>
    </div>
  );
};

export default StarRating;
