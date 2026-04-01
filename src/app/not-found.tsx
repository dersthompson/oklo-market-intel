import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-53px)] gap-4">
      <h1 className="text-6xl font-black text-[var(--accent)]">404</h1>
      <p className="text-xl font-semibold text-[var(--foreground)]">Page not found</p>
      <p className="text-sm text-[var(--muted)]">The country or page you are looking for does not exist.</p>
      <Link href="/" className="mt-2 text-sm font-semibold text-[var(--accent)] hover:underline">
        Back to Map
      </Link>
    </div>
  );
}
