"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    { href: "/watchlist", label: "Watchlist" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold tracking-tight">
              Mood<span className="text-[var(--accent)]">Flix</span>
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[var(--foreground)]",
                  pathname === link.href
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search + Theme */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block w-64">
              <SearchBar compact />
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-4 pb-3 -mt-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-xs font-medium transition-colors",
                pathname === link.href
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
