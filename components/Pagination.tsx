import React, { useState, useEffect } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const [sliderValue, setSliderValue] = useState(currentPage);

  useEffect(() => {
    setSliderValue(currentPage);
  }, [currentPage]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = parseInt(event.target.value, 10);
    setSliderValue(newPage);
  };

  const handleSliderRelease = () => {
    onPageChange(sliderValue);
  };

  const pageNumbers = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col items-center space-y-4 mt-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          First
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        {startPage > 1 && <span className="px-2">...</span>}
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-3 py-1 rounded ${
              number === currentPage
                ? 'bg-blue-700 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {number}
          </button>
        ))}
        {endPage < totalPages && <span className="px-2">...</span>}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Last
        </button>
      </div>
      <div className="w-full max-w-md flex items-center space-x-2">
        <input
          type="range"
          min="1"
          max={totalPages}
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseUp={handleSliderRelease}
          onKeyUp={handleSliderRelease}
          className="w-full"
        />
        <span className="text-sm">
          Page {sliderValue} of {totalPages}
        </span>
      </div>
    </div>
  );
}

