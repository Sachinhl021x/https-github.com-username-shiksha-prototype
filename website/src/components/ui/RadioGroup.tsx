import { forwardRef } from 'react';
import { cn } from '@/lib/utils/classNames';

export interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ options, name, value, onChange, error, disabled, className }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              className={cn(
                'h-4 w-4 border-gray-300 text-primary focus:ring-primary',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-red-500'
              )}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className={cn(
                'ml-3 block text-sm font-medium text-gray-700',
                disabled && 'opacity-50'
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';

export { RadioGroup };