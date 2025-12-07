interface FilterOption {
    label: string;
    value: string;
  }
  
  interface FilterGroupProps {
    label: string;
    options: FilterOption[];
    selected?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
  }
  
  export function FilterGroup({
    label,
    options,
    selected,
    onChange,
    disabled
  }: FilterGroupProps) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                selected === option.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }