'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const range: (number | string)[] = [];
    const delta = 1; // Show current page, 1 before and 1 after

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 py-4 flex-wrap">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed bg-white"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`dots-${index}`} className="px-2 text-slate-400 select-none">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`w-9 h-9 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
              currentPage === page
                ? 'bg-amber-600 text-white border border-amber-600'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed bg-white"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
