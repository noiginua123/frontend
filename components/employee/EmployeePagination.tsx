'use client';

import React from 'react';
import { ADM002_PAGE_SIZE } from '@/constants/adm002';

interface EmployeePaginationProps {
  currentPage: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 7;

/**
 * Tạo danh sách số trang cần hiển thị quanh trang hiện tại.
 *
 * @param currentPage Trang hiện tại
 * @param totalPages Tổng số trang
 * @return Danh sách số trang cần hiển thị
 */
function createVisiblePages(currentPage: number, totalPages: number): number[] {
  const visiblePageCount = Math.min(totalPages, MAX_VISIBLE_PAGES);
  const maximumStartPage = totalPages - visiblePageCount + 1;
  const startPage = Math.max(
    1,
    Math.min(currentPage - Math.floor(visiblePageCount / 2), maximumStartPage),
  );

  return Array.from(
    { length: visiblePageCount },
    (_, index) => startPage + index,
  );
}

/**
 * Hiển thị thanh phân trang danh sách nhân viên ADM002.
 *
 * @param currentPage Trang hiện tại
 * @param totalRecords Tổng số nhân viên thỏa mãn điều kiện tìm kiếm
 * @param onPageChange Hàm xử lý khi người dùng chuyển trang
 * @return Thanh phân trang hoặc null khi danh sách chỉ có một trang
 */
export const EmployeePagination: React.FC<EmployeePaginationProps> = ({
  currentPage,
  totalRecords,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalRecords / ADM002_PAGE_SIZE);
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = createVisiblePages(currentPage, totalPages);

  return (
    <nav className="employee-pagination" aria-label="従業員一覧ページ">
      <button
        type="button"
        disabled={currentPage === 1}
        aria-label="前のページ"
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹
      </button>
      {visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          className={page === currentPage ? 'active' : ''}
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage === totalPages}
        aria-label="次のページ"
        onClick={() => onPageChange(currentPage + 1)}
      >
        ›
      </button>
    </nav>
  );
};
