import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  compact?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  min = 1,
  max = 999,
  onChange,
  compact = false
}) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div
      className={`inline-flex items-center bg-white border border-[#051f20]/15 rounded-full ${
        compact ? 'p-0.5 gap-1' : 'p-1 gap-2'
      }`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={`flex items-center justify-center rounded-full transition-colors ${
          compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
        } ${
          value <= min
            ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
            : 'bg-[#f2f7f5] text-[#163832] hover:bg-[#a3c5a8]/30 active:scale-95'
        }`}
        aria-label="Decrease quantity"
      >
        <Minus size={compact ? 12 : 14} />
      </button>

      <span
        className={`font-semibold text-[#051f20] text-center ${
          compact ? 'min-w-[20px] text-xs' : 'min-w-[28px] text-sm'
        }`}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={`flex items-center justify-center rounded-full transition-colors ${
          compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
        } ${
          value >= max
            ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
            : 'bg-[#163832] text-white hover:bg-[#0b2924] active:scale-95'
        }`}
        aria-label="Increase quantity"
      >
        <Plus size={compact ? 12 : 14} />
      </button>
    </div>
  );
};
