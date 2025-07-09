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
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center">
      <div className="container mx-auto px-4">
        {/* Hero Section with Search */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to MovieApp
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover amazing movies, learn about talented actors, and join our
            community of film enthusiasts.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 py-6"
            >
              <Link href="/movies">Browse Movies</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="text-lg px-8 py-6 bg-transparent"
            >
              <Link href="/actors">Meet Actors</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
