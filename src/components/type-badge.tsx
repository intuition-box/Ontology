import { ATOM_CATEGORIES, type AtomCategory } from '../data/atom-types';

interface TypeBadgeProps {
  typeId: string;
  category: AtomCategory;
  size?: 'sm' | 'md';
}

export function TypeBadge({ typeId, category, size = 'sm' }: TypeBadgeProps) {
  const { color } = ATOM_CATEGORIES[category];
  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ${sizeClasses}`}
      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {typeId}
    </span>
  );
}
