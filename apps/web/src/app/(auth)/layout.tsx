import Link from 'next/link';

/** Centered, elegant layout for auth screens. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-12">
      <Link href="/" className="mb-8 font-serif text-3xl font-bold text-blush-500">
        Hediyola
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
