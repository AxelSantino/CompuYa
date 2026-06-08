import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { usePagination } from '@/hooks/usePagination';

const TestPagination = ({ items }: { items: number[] }) => {
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    currentPageData,
  } = usePagination(items, 10);

  return (
    <div>
      <div data-testid="current-page">{currentPage}</div>
      <div data-testid="total-pages">{totalPages}</div>
      <div data-testid="page-size">{pageSize}</div>
      <div data-testid="items">{currentPageData.join(',')}</div>
      <button type="button" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
      <button type="button" onClick={() => setPageSize(15)}>Set Size 15</button>
    </div>
  );
};

describe('usePagination', () => {
  it('divide correctamente la lista en páginas y actualiza el tamaño de página', async () => {
    const user = userEvent.setup();
    const items = Array.from({ length: 25 }, (_, i) => i + 1);

    render(<TestPagination items={items} />);

    expect(screen.getByTestId('total-pages')).toHaveTextContent('3');
    expect(screen.getByTestId('current-page')).toHaveTextContent('1');
    expect(screen.getByTestId('items')).toHaveTextContent('1,2,3,4,5,6,7,8,9,10');

    await user.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByTestId('current-page')).toHaveTextContent('2');
    expect(screen.getByTestId('items')).toHaveTextContent('11,12,13,14,15,16,17,18,19,20');

    await user.click(screen.getByRole('button', { name: /Set Size 15/i }));
    expect(screen.getByTestId('page-size')).toHaveTextContent('15');
    expect(screen.getByTestId('total-pages')).toHaveTextContent('2');
    expect(screen.getByTestId('items')).toHaveTextContent('16,17,18,19,20,21,22,23,24,25');
  });
});
