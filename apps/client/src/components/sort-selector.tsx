'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MovieSortOption } from '@/lib/sorting';
import { ArrowUpDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export type SortOption = {
  value: string;
  label: string;
};

interface SortSelectorProps {
  options: MovieSortOption[];
  currentValue: string;
  baseUrl: string;
}

export function SortSelector({
  options,
  currentValue,
  baseUrl,
}: SortSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleValueChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    const selectedOption = options.find((opt) => opt.value === value);
    if (!selectedOption) return;

    // Set sortBy and sortOrder explicitly
    newParams.set('sortBy', selectedOption.value);
    if (selectedOption.sortOrder) {
      newParams.set('sortOrder', selectedOption.sortOrder);
    } else {
      newParams.delete('sortOrder');
    }
    // Remove legacy 'sort' param if present
    newParams.delete('sort');
    // Reset to page 1 when changing sort
    newParams.delete('page');

    const queryString = newParams.toString();
    const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    router.push(newUrl);
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select value={currentValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
