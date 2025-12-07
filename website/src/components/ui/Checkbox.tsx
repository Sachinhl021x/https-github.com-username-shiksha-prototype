import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/classNames';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, disabled, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor={props.id}
            className={cn(
              'font-medium text-gray-700',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };