'use client';

import React, { Fragment } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EmployeeListItem, SortField, SortOrder } from '@/types/employee';
import { formatEmployeeDate } from '@/utils/employee';

interface Props {
  employees: EmployeeListItem[];
  isLoading: boolean;
  errorMessage: string | null;
  currentPage: number;
  totalPages: number;
  visiblePages: number[];
  employeeNameSort: SortOrder;
  certificationSort: SortOrder;
  endDateSort: SortOrder;
  prioritySortField?: SortField;
  onPageChange: (page: number) => void | Promise<void>;
  onSortChange: (sortKey: SortField) => void | Promise<void>;
  emptyMessage?: string;
}

/**
 * Component hiển thị bảng danh sách nhân viên kèm sắp xếp và phân trang.
 *
 * @param props Các thuộc tính truyền vào component
 * @return Giao diện bảng danh sách nhân viên
 */
const EmployeeTable = ({
  employees,
  isLoading,
  errorMessage,
  currentPage,
  totalPages,
  visiblePages,
  employeeNameSort,
  certificationSort,
  endDateSort,
  prioritySortField = 'employeeName',
  onPageChange,
  onSortChange,
  emptyMessage = '検索条件に該当するユーザが見つかりません。',
}: Props) => {
  const searchParams = useSearchParams();
  const queryString = searchParams ? searchParams.toString() : '';

  /**
   * Tạo đường dẫn đến màn hình chi tiết nhân viên ADM003 kèm theo các query params hiện tại.
   *
   * @param id ID nhân viên cần xem chi tiết
   * @return Chuỗi đường dẫn chi tiết
   */
  const getHref = (id: number) => {
    return `/employees/adm003?id=${id}${queryString ? `&${queryString}` : ''}`;
  };

  /**
   * Hiển thị nhãn cột kèm biểu tượng chiều sắp xếp (▲▽ / ▼△).
   * Hiển thị icon theo đúng chiều sắp xếp đang lưu của từng cột trong sortState.
   *
   * @param label Tên nhãn hiển thị của cột
   * @param sortOrder Chiều sắp xếp (ASC / DESC)
   * @return Chuỗi nhãn kèm biểu tượng sắp xếp
   */
  const renderSortLabel = (label: string, sortOrder: SortOrder) => {
    const icon = sortOrder === 'ASC' ? '▲▽' : '▼△';
    return `${label} ${icon}`;
  };

  return (
    <div className="row row-table">
      <div className="css-grid-table box-shadow">
        {/* Table Header */}
        <div className="css-grid-table-header">
          <div>ID</div>
          <div
            className={`sort-header-button ${prioritySortField === 'employeeName' ? 'font-weight-bold text-dark' : ''}`}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              fontWeight: prioritySortField === 'employeeName' ? 'bold' : 'normal',
            }}
            onClick={() => void onSortChange('employeeName')}
          >
            {renderSortLabel('氏名', employeeNameSort)}
          </div>
          <div>生年月日</div>
          <div>グループ</div>
          <div>メールアドレス</div>
          <div>電話番号</div>
          <div
            className={`sort-header-button ${prioritySortField === 'certificationName' ? 'font-weight-bold text-dark' : ''}`}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              fontWeight: prioritySortField === 'certificationName' ? 'bold' : 'normal',
            }}
            onClick={() => void onSortChange('certificationName')}
          >
            {renderSortLabel('日本語能力', certificationSort)}
          </div>
          <div
            className={`sort-header-button ${prioritySortField === 'endDate' ? 'font-weight-bold text-dark' : ''}`}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              fontWeight: prioritySortField === 'endDate' ? 'bold' : 'normal',
            }}
            onClick={() => void onSortChange('endDate')}
          >
            {renderSortLabel('失効日', endDateSort)}
          </div>
          <div>点数</div>
        </div>

        {/* Loading / Error / Empty States */}
        {isLoading && <div className="p-3" style={{ gridColumn: '1 / -1', padding: '16px' }}>Loading...</div>}
        {!isLoading && errorMessage && (
          <div className="p-3 text-danger box-err-content adm002-error-message" style={{ gridColumn: '1 / -1', margin: '16px' }}>
            {errorMessage}
          </div>
        )}
        {!isLoading && !errorMessage && employees.length === 0 && (
          <div className="p-3" style={{ gridColumn: '1 / -1', padding: '16px', textAlign: 'center' }}>
            {emptyMessage}
          </div>
        )}

        {/* Table Body */}
        {!isLoading && !errorMessage && employees.length > 0 && (
          <div className="css-grid-table-body">
            {employees.map((e, index) => (
              <Fragment
                key={`${e.employeeId}-${e.certificationName ?? 'none'}-${e.endDate ?? 'none'}-${index}`}
              >
                <div className="bor-l-none text-center">
                  <Link href={getHref(e.employeeId)} className="no-underline text-black hover-primary">
                    {e.employeeId}
                  </Link>
                </div>
                <div title={e.employeeName}>{e.employeeName}</div>
                <div>{formatEmployeeDate(e.employeeBirthDate)}</div>
                <div>{e.departmentName ?? ''}</div>
                <div>{e.employeeEmail ?? ''}</div>
                <div>{e.employeeTelephone ?? ''}</div>
                <div>{e.certificationName ?? ''}</div>
                <div>{formatEmployeeDate(e.endDate)}</div>
                <div>{e.score !== null && e.score !== undefined ? e.score : ''}</div>
              </Fragment>
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="pagin" style={{ gridColumn: '1 / -1' }}>
            <button
              type="button"
              className="btn btn-sm btn-pre btn-falcon-default"
              onClick={() => void onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              &lt;
            </button>
            {visiblePages.map((page, index) => {
              const previousPage = visiblePages[index - 1];
              const shouldShowEllipsis = previousPage && page - previousPage > 1;

              return (
                <Fragment key={page}>
                  {shouldShowEllipsis && (
                    <span className="btn btn-sm btn-falcon-default" style={{ cursor: 'default' }}>...</span>
                  )}
                  <button
                    type="button"
                    className={`btn btn-sm btn-falcon-default ${page === currentPage ? 'text-dark active' : 'text-primary'
                      }`}
                    onClick={() => void onPageChange(page)}
                    disabled={page === currentPage || isLoading}
                  >
                    {page}
                  </button>
                </Fragment>
              );
            })}
            <button
              type="button"
              className="btn btn-sm btn-next btn-falcon-default"
              onClick={() => void onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { EmployeeTable };
export default EmployeeTable;
