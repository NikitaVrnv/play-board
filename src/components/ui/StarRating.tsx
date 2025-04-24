// src/components/ui/StarRating.tsx
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils'; // Make sure you have this utility function in src/lib/utils.ts

interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;        // The rating value (e.g., 3.5)
  readOnly?: boolean;   // If true, stars are not interactive
  size?: 'sm' | 'md' | 'lg'; // Optional size control
  maxRating?: number;   // Max rating (usually 5)
  // Add onChange prop if it needs to be interactive for forms
  // onChange?: (rating: number) => void;
}

const starSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function StarRating({
  value,
  readOnly = true,
  size = 'md',
  maxRating = 5,
  className,
  // onChange, // Uncomment if needed
  ...props
}: StarRatingProps) {
  // Clamp the value between 0 and maxRating
  // Use Math.round or Math.floor depending on if you want half-stars visually handled differently
  const clampedValue = Math.max(0, Math.min(maxRating, Math.round(value || 0)));

  // Handler for clicking a star (only if not readOnly)
  // const handleClick = (index: number) => {
  //   if (!readOnly && onChange) {
  //     onChange(index + 1);
  //   }
  // };

  return (
    <div className={cn("flex items-center gap-0.5", className)} {...props}>
      {[...Array(maxRating)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            starSizeClasses[size],
            i < clampedValue
              ? 'fill-yellow-400 text-yellow-500' // Filled star style
              : 'fill-muted text-muted-foreground', // Empty star style
            !readOnly ? 'cursor-pointer hover:scale-110 transition-transform' : '' // Interactive style
          )}
          // Add onClick handler if needed
          // onClick={() => handleClick(i)}
        />
      ))}
    </div>
  );
}