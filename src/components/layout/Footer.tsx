export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">
            Mood<span className="text-[var(--accent)]">Flix</span> \u2014 Movie
            recommendations based on your mood
          </p>
          <p className="text-xs text-[var(--muted)]">
            Powered by TMDB. This product uses the TMDB API but is not endorsed
            or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
