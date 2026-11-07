import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export type PageSizeLimit = 10 | 50 | 100 | 'all';

export interface DataTablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: PageSizeLimit;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSizeLimit) => void;
  itemName?: string;
  className?: string;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemName = 'data',
  className = '',
}) => {
  const effectivePageSize = pageSize === 'all' ? Math.max(totalItems, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : pageSize === 'all' ? 1 : (validPage - 1) * pageSize + 1;
  const endItem = pageSize === 'all' ? totalItems : Math.min(validPage * pageSize, totalItems);

  const pageSizeOptions: PageSizeLimit[] = [10, 50, 100, 'all'];

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 rounded-b-xl select-none ${className}`}
    >
      {/* 1. Counter: Menampilkan X - Y dari Z data */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          Menampilkan <span className="font-bold text-slate-800 dark:text-slate-100">{startItem}</span> -{' '}
          <span className="font-bold text-slate-800 dark:text-slate-100">{endItem}</span> dari{' '}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalItems}</span> {itemName}
        </span>
      </div>

      {/* 2. Middle & Right: Gradasi Limit & Tombol Navigasi Halaman */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Selector Gradasi: 10, 50, 100, All */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1.5">
            Tampilkan:
          </span>
          {pageSizeOptions.map((opt) => {
            const isSelected = pageSize === opt;
            const label = opt === 'all' ? 'Semua' : opt.toString();
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onPageSizeChange(opt)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={`Batasi ${label} baris per halaman`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Navigation Page Buttons (only needed if not 'all' and totalPages > 1) */}
        {pageSize !== 'all' && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={validPage <= 1}
              onClick={() => onPageChange(1)}
              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={validPage <= 1}
              onClick={() => onPageChange(validPage - 1)}
              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <span className="px-2 font-semibold text-[11px] text-slate-700 dark:text-slate-200">
              Hal <span className="font-bold text-emerald-600 dark:text-emerald-400">{validPage}</span> / {totalPages}
            </span>

            <button
              type="button"
              disabled={validPage >= totalPages}
              onClick={() => onPageChange(validPage + 1)}
              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={validPage >= totalPages}
              onClick={() => onPageChange(totalPages)}
              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
