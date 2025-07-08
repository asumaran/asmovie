'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export type SortOption = {
  value: string;
  label: string;
};

interface SortSelectorProps {
  options: SortOption[];
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

    // Set the new sort value
    if (value === options[0].value) {
      newParams.delete('sort'); // Default value, no need to store in URL
    } else {
      newParams.set('sort', value);
    }

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
