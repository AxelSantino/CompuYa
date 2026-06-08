import React from 'react';
import { Select } from './Select';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export const PaginationControls = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15],
}: PaginationControlsProps) => {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-gray-600">
        Mostrando {pageSize} elementos por página · Página {currentPage} de {totalPages}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <label htmlFor="pageSize" className="font-medium">Elementos:</label>
          <Select
            id="pageSize"
            value={pageSize.toString()}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="w-24"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
        <div className="inline-flex overflow-hidden rounded-md border border-gray-200 shadow-sm">
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium ${currentPage === 1 ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <button
            type="button"
            className="px-3 py-2 text-sm font-medium bg-white text-gray-700 border-l border-r border-gray-200"
            disabled
          >
            {currentPage} / {totalPages}
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium ${currentPage === totalPages ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};
