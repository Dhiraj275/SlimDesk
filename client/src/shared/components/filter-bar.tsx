// components/FilterBar.tsx
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import type { FilterField } from '@/shared/types/filters';

interface FilterBarProps {
  filters: FilterField[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function FilterBar({
  filters,
  values,
  onChange,
  onSubmit
}: FilterBarProps) {
  return (
    <div className='flex gap-x-4'>
      {filters.map((filter) => {
        if (filter.type === 'select') {
          return (
            <Select
              key={filter.key}
              value={values[filter.key] || ''}
              onValueChange={(val) => onChange(filter.key, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }

        return (
          <Input
            key={filter.key}
            type={filter.type}
            placeholder={filter.placeholder}
            value={values[filter.key] ?? ''}
            onChange={(e: any) => onChange(filter.key, e.target.value)}
          />
        );
      })}
      <Button onClick={onSubmit}>Search</Button>
    </div>
  );
}
