interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
  }
  
  export function Pagination({ 
    currentPage, 
    totalPages, 
    onPageChange,
    isLoading 
  }: PaginationProps) {
    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="px-3 py-2 rounded-md border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'border border-gray-200 hover:border-gray-300'
              }`}
            >
              {page}
            </button>
          );
        })}
  
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="px-3 py-2 rounded-md border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  }