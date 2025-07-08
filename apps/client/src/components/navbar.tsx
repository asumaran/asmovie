import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">MovieApp</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/movies"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Movies
            </Link>
            <Link
              href="/actors"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Actors
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex md:hidden">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <span className="font-bold">MovieApp</span>
              </Link>
            </div>
          </div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="border-t md:hidden">
        <nav className="flex items-center justify-center space-x-6 py-2 text-sm font-medium">
          <Link
            href="/movies"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Movies
          </Link>
          <Link
            href="/actors"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Actors
          </Link>
        </nav>
      </div>
    </nav>
  );
}
