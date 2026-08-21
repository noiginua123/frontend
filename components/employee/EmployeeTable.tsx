'use client';

import React from 'react';
import Link from 'next/link';
import { ADM002_MESSAGES } from '@/constants/adm002';
import {
  EmployeeListDTO,
  EmployeeSearchFilter,
  SortField,
  SortOrder,
  SortState,
} from '@/types/employee';
import {
  formatEmployeeDate,
  truncateEmployeeName,
} from '@/utils/employee';

interface EmployeeTableProps {
  employees: EmployeeListDTO[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  searchParams: EmployeeSearchFilter;
  sortState: SortState;
  activeSortField: SortField;
  onSort: (field: SortField) => void;
}

/**
 * Hiển thị danh sách nhân viên và điều khiển sắp xếp của ADM002.
 *
 * @param employees Danh sách nhân viên cần hiển thị
 * @param loading Trạng thái đang tải danh sách
 * @param error Thông báo lỗi khi lấy danh sách nhân viên
 * @param currentPage Trang hiện tại
 * @param searchParams Điều kiện tìm kiếm hiện tại
 * @param sortState Trạng thái chiều sắp xếp của từng cột
 * @param activeSortField Cột đang được dùng để sắp xếp
 * @param onSort Hàm xử lý khi người dùng chọn cột sắp xếp
 * @return Bảng danh sách nhân viên ADM002
 */
export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  error,
  currentPage,
  searchParams,
  sortState,
  activeSortField,
  onSort,
}) => {
  /**
   * Tạo đường dẫn đến màn hình chi tiết và giữ lại trạng thái của ADM002.
   *
   * @param employeeId ID nhân viên được chọn
   * @return Đường dẫn đến màn hình chi tiết nhân viên ADM003
   */
  const getDetailUrl = (employeeId: number) => {
    const params = new URLSearchParams();
    params.set('id', String(employeeId));
    params.set('page', String(currentPage));
    params.set('active_sort', activeSortField);
    params.set('ord_employee_name', sortState.ordEmployeeName);
    params.set('ord_certification_name', sortState.ordCertificationName);
    params.set('ord_end_date', sortState.ordEndDate);

    if (searchParams.fullname.trim()) {
      params.set('employee_name', searchParams.fullname.trim());
    }
    if (searchParams.departmentId) {
      params.set('department_id', searchParams.departmentId);
    }
    return `/employees/adm003?${params.toString()}`;
  };

  /**
   * Tạo biểu tượng thể hiện chiều sắp xếp của một cột.
   *
   * @param order Chiều sắp xếp hiện tại
   * @return Cặp biểu tượng sắp xếp tăng dần và giảm dần
   */
  const renderSortIcons = (order: SortOrder) => {
    const isAsc = order === 'ASC';
    return (
      <span
        style={{
          marginLeft: '4px',
          display: 'inline-flex',
          gap: '2px',
          fontSize: '11px',
          verticalAlign: 'baseline',
        }}
      >
        <span>{isAsc ? '▲' : '▼'}</span>
        <span>{isAsc ? '▽' : '△'}</span>
      </span>
    );
  };

  return (
    <div className="row row-table">
      {error && (
        <div className="box-err-content adm002-error-message">
          {error}
        </div>
      )}

      {!loading && !error && employees.length === 0 && (
        <div className="box-err-content adm002-error-message">
          {ADM002_MESSAGES.employeeNotFound}
        </div>
      )}

      <div className="css-grid-table box-shadow">
        <div className="css-grid-table-header">
          <div>ID</div>
          <div
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => onSort('employeeName')}
            title="クリックしてソート切り替え"
          >
            <span>氏名</span>
            {renderSortIcons(sortState.ordEmployeeName)}
          </div>
          <div>生年月日</div>
          <div>グループ</div>
          <div>メールアドレス</div>
          <div>電話番号</div>
          <div
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => onSort('certificationName')}
            title="クリックしてソート切り替え"
          >
            <span>日本語能力</span>
            {renderSortIcons(sortState.ordCertificationName)}
          </div>
          <div
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => onSort('endDate')}
            title="クリックしてソート切り替え"
          >
            <span>失効日</span>
            {renderSortIcons(sortState.ordEndDate)}
          </div>
          <div>点数</div>
        </div>

        <div
          className="css-grid-table-body"
          style={loading ? { gridTemplateColumns: '100%' } : undefined}
        >
          {loading ? (
            <div className="text-center" style={{ padding: '24px', gridColumn: '1 / -1', borderLeft: 'none' }}>
              {ADM002_MESSAGES.loading}
            </div>
          ) : (
            employees.map((emp) => (
              <React.Fragment key={emp.employeeId}>
                <div className="bor-l-none text-center">
                  <Link href={getDetailUrl(emp.employeeId)}>{emp.employeeId}</Link>
                </div>
                <div className="employee-name-cell" title={emp.employeeName}>
                  {truncateEmployeeName(emp.employeeName)}
                </div>
                <div>{formatEmployeeDate(emp.employeeBirthDate)}</div>
                <div>{emp.departmentName || ''}</div>
                <div>{emp.employeeEmail || ''}</div>
                <div>{emp.employeeTelephone || ''}</div>
                <div>{emp.certificationName || ''}</div>
                <div>{formatEmployeeDate(emp.endDate)}</div>
                <div>{emp.score !== null && emp.score !== undefined ? emp.score : ''}</div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
