'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SearchForm() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const slug = formData.get('slug')?.toString().trim();
    if (slug) {
      router.push(`/list/${slug}`);
    }
  };

  return (
    <form className="mt-8" onSubmit={handleSubmit}>
      <div className="flex overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft focus-within:ring-2 focus-within:ring-blush-400">
        <input
          name="slug"
          type="text"
          placeholder="Örn: ayse-ve-mehmet"
          className="flex-1 bg-transparent px-5 py-4 text-ink outline-none placeholder:text-ink/40"
        />
        <button
          type="submit"
          className="flex items-center gap-2 bg-blush-500 px-6 text-sm font-medium text-white transition hover:bg-blush-600"
        >
          <Search className="h-4 w-4" /> Ara
        </button>
      </div>
    </form>
  );
}
