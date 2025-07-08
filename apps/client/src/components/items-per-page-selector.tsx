'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';

interface ItemsPerPageSelectorProps {
  currentValue: number;
  baseUrl: string;
}

export function ItemsPerPageSelector({
  currentValue,
  baseUrl,
}: ItemsPerPageSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleValueChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);

    // Set the new per_page value
    if (value === '10') {
      newParams.delete('per_page'); // Default value, no need to store in URL
    } else {
      newParams.set('per_page', value);
    }

    // Reset to page 1 when changing items per page
    newParams.delete('page');

    const queryString = newParams.toString();
    const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    router.push(newUrl);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Show:</span>
      <Select value={currentValue.toString()} onValueChange={handleValueChange}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="15">15</SelectItem>
          <SelectItem value="20">20</SelectItem>
        </SelectContent>
      </Select>
      <span className="text-sm text-muted-foreground">per page</span>
    </div>
  );
}
