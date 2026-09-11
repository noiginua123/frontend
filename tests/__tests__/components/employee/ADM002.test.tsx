import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ADM002 from '@/components/employee/ADM002';
import { useADM002 } from '@/hooks/useADM002';

jest.mock('@/hooks/useADM002');

const mockUseADM002 = useADM002 as jest.MockedFunction<typeof useADM002>;

describe('ADM002 Component - Pagination Redesign', () => {
  const defaultMockReturn = {
    departments: [],
    employees: [],
    totalPages: 15,
    visiblePages: [1, 2, 15],
    currentPage: 1,
    loading: false,
    departmentError: null,
    employeeError: null,
    sortState: {
      employeeName: null,
      certificationName: null,
      endDate: null,
    },
    prioritySortField: null,
    register: jest.fn(() => ({ name: 'test', onBlur: jest.fn(), onChange: jest.fn(), ref: jest.fn() })),
    errors: {},
    onSearchSubmit: jest.fn((e) => e.preventDefault()),
    getHref: jest.fn(() => '#'),
    renderSortLabel: jest.fn((label) => label),
    handleSort: jest.fn(),
    handlePageChange: jest.fn(),
    handleNavigateToAdd: jest.fn(),
    handleViewDetail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseADM002.mockReturnValue(defaultMockReturn as any);
  });

  it('renders pagination with SVG icons and page buttons matching Falcon style', () => {
    render(<ADM002 />);

    // Previous button should be disabled on first page
    const prevBtn = screen.getByRole('button', { name: /previous page/i });
    expect(prevBtn).toBeInTheDocument();
    expect(prevBtn).toBeDisabled();
    expect(prevBtn).toHaveClass('btn-pre', 'btn-falcon-default');
    expect(prevBtn.querySelector('svg.fa-chevron-left')).toBeInTheDocument();

    // Next button
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    expect(nextBtn).toBeInTheDocument();
    expect(nextBtn).not.toBeDisabled();
    expect(nextBtn).toHaveClass('btn-next', 'btn-falcon-default');
    expect(nextBtn.querySelector('svg.fa-chevron-right')).toBeInTheDocument();

    // Page numbers
    const page1Btn = screen.getByRole('button', { name: '1' });
    const page2Btn = screen.getByRole('button', { name: '2' });
    const page15Btn = screen.getByRole('button', { name: '15' });

    expect(page1Btn).toHaveClass('active', 'btn-active');
    expect(page1Btn).not.toHaveClass('text-primary');
    expect(page2Btn).toHaveClass('text-primary', 'btn-falcon-default');
    expect(page15Btn).toHaveClass('text-primary', 'btn-falcon-default');

    // Ellipsis
    const ellipsisContainer = document.querySelector('.pagin-ellipsis');
    expect(ellipsisContainer).toBeInTheDocument();
    expect(ellipsisContainer?.querySelector('svg.fa-ellipsis-h')).toBeInTheDocument();
  });

  it('triggers handlePageChange when page 2 is clicked', () => {
    render(<ADM002 />);

    const page2Btn = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Btn);

    expect(defaultMockReturn.handlePageChange).toHaveBeenCalledWith(2);
  });

  it('triggers handlePageChange when next button is clicked', () => {
    render(<ADM002 />);

    const nextBtn = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextBtn);

    expect(defaultMockReturn.handlePageChange).toHaveBeenCalledWith(2);
  });
});
