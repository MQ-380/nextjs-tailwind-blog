import { Dispatch, SetStateAction } from 'react';

import { Button } from '@headlessui/react';

interface PaginationProps {
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
}

export default function Pagination({ totalPages, currentPage, setCurrentPage }: PaginationProps) {
  const handleChangePage = (step: number) => {
    setCurrentPage((page) => page + step);
  };

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        <Button disabled={currentPage === 1} onClick={() => handleChangePage(-1)}>
          Prev
        </Button>
        <Button disabled={currentPage === totalPages} onClick={() => handleChangePage(1)}>
          Next
        </Button>
      </nav>
    </div>
  );
}
