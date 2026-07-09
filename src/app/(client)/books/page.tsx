'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { bookService } from '@/services/bookService';
import { Book, Category } from '@/types';
import Loading from '@/components/Loading';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 5; // Set to 5 to easily demo pagination with small seed dataset

function BooksCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedBooks, fetchedCats] = await Promise.all([
          bookService.getAllBooks(),
          bookService.getAllCategories(),
        ]);
        setBooks(fetchedBooks);
        setCategories(fetchedCats);
      } catch (error) {
        console.error('Error fetching data for books page:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update query params in URL
  const updateUrl = (search: string, cat: string, sort: string, page: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (cat) params.set('category', cat);
    if (sort) params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    
    router.push(`/books?${params.toString()}`);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateUrl(query, selectedCategory, sortBy, 1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    updateUrl(searchQuery, category, sortBy, 1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
    updateUrl(searchQuery, selectedCategory, sort, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(searchQuery, selectedCategory, sortBy, page);
  };

  if (loading) {
    return <Loading />;
  }

  // Filter and sort client-side (to run out-of-the-box smoothly)
  let filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? book.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  // Sort logic
  filteredBooks.sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    // Default popular: sort by sold count
    return b.sold - a.sold;
  });

  // Pagination calculation
  const totalItems = filteredBooks.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6 flex-1">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
          Danh mục Sách
        </h1>
        <p className="text-sm text-slate-450">
          Tìm thấy <span className="font-bold text-slate-700">{totalItems}</span> cuốn sách phù hợp
        </p>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        categories={categories}
      />

      <ProductGrid books={paginatedBooks} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <BooksCatalog />
    </Suspense>
  );
}
