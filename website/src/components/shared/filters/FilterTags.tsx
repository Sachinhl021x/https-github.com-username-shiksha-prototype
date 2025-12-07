import { X } from 'lucide-react';

interface FilterTag {
  id: string;
  label: string;
  type: string;
}

interface FilterTagsProps {
  tags: FilterTag[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function FilterTags({ tags, onRemove, disabled }: FilterTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
        >
          <span className="text-xs text-gray-500">{tag.type}:</span>
          <span>{tag.label}</span>
          <button
            onClick={() => onRemove(tag.id)}
            disabled={disabled}
            className="p-0.5 hover:bg-gray-200 rounded-full disabled:opacity-50"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}