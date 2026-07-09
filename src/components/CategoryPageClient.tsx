'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookService } from '@/services/bookService';
import { Book, Category } from '@/types';
import Loading from '@/components/Loading';
import ProductGrid from '@/components/ProductGrid';
import { ArrowLeft } from 'lucide-react';

interface CategoryPageClientProps {
  slug: string;
}

export default function CategoryPageClient({ slug }: CategoryPageClientProps) {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryData() {
      try {
        const [allBooks, allCats] = await Promise.all([
          bookService.getAllBooks(),
          bookService.getAllCategories(),
        ]);

        const currentCat = allCats.find(cat => cat.slug === slug);
        if (currentCat) {
          setCategory(currentCat);
          const filtered = allBooks.filter(b => b.category === slug);
          setBooks(filtered);
        } else {
          router.push('/books');
        }
      } catch (error) {
        console.error('Error fetching category page data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadCategoryData();
    }
  }, [slug]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!category) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6 flex-1">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Thể loại sách</span>
          <h1 className="text-xl md:text-2xl font-black text-slate-800">{category.name}</h1>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <p className="text-sm text-slate-500">
          Tìm thấy <span className="font-bold text-slate-700">{books.length}</span> cuốn sách thuộc danh mục này
        </p>
      </div>

      <ProductGrid books={books} />
    </div>
  );
}
