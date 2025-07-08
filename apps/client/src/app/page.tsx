'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Hero Section with Search */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">Welcome to MovieApp</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover amazing movies, learn about talented actors, and join our
          community of film enthusiasts.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for movies or actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-full border-2 focus:border-primary"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-8"
              >
                Search
              </Button>
            </div>
          </form>
          <p className="text-sm text-muted-foreground mt-2">
            Search by movie title or actor name
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/movies">Browse Movies</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/actors">Meet Actors</Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
    </div>
  );
}
