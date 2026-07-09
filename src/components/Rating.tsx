'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  onChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  onChange,
  size = 18,
  readOnly = true,
}) => {
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  return (
    <div className="flex items-center gap-1">
      {stars.map((starValue) => {
        const isFilled = starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(starValue)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} focus:outline-none`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
export default Rating;
