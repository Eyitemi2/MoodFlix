export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold tracking-tight mb-4">
        Mood<span className="text-[var(--accent)]">Flix</span>
      </h1>
      <p className="text-[var(--muted)] text-lg mb-8 text-center max-w-md">
        Tell us how you feel. We&apos;ll tell you what to watch.
      </p>
      <p className="text-sm text-[var(--muted)]">
        Frontend coming in Phase 4
      </p>
    </div>
  );
}
