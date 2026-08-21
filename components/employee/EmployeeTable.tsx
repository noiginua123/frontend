'use client';

import React from 'react';
import Link from 'next/link';
import { EmployeeListDTO, SortState, SortOrder } from '@/types/employee';
import { SearchFilter } from '@/hooks/useADM002';

interface EmployeeTableProps {
  employees: EmployeeListDTO[];
  loading: boolean;
  error: string | null;
  searchParams: SearchFilter;
  sortState: SortState;
  onSort: (field: 'employeeName' | 'certificationName' | 'endDate') => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  error,
  searchParams,
  sortState,
  onSort,
}) => {
  // Tạo link điều hướng sang ADM003 kèm ID và query search
  const getDetailUrl = (employeeId: number) => {
    const params = new URLSearchParams();
    params.set('id', String(employeeId));
    if (searchParams.fullname.trim()) {
      params.set('employee_name', searchParams.fullname.trim());
    }
    if (searchParams.departmentId) {
      params.set('department_id', searchParams.departmentId);
    }
    return `/employees/adm003?${params.toString()}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr.replace(/-/g, '/');
  };

  // Render 2 icon mũi tên:
  // - ASC (Tăng): mũi đen lên (▲) ở bên trái, mũi trắng xuống (▽) ở bên phải
  // - DESC (Giảm): mũi đen xuống (▼) ở bên trái, mũi trắng lên (△) ở bên phải
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
      {/* Thông báo lỗi khi gọi API thất bại */}
      {error && (
        <div className="box-err-content" style={{ marginBottom: '16px', width: '100%' }}>
          {error}
        </div>
      )}

      {/* Thông báo danh sách rỗng (MSG005) */}
      {!loading && !error && employees.length === 0 && (
        <div className="box-err-content" style={{ marginBottom: '16px', width: '100%' }}>
          検索条件に該当するユーザが見つかりません。
        </div>
      )}

      <div className="css-grid-table box-shadow">
        {/* Header bảng - 9 cột đúng chuẩn ADM002, 3 cột có icon Sort */}
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

        {/* Body bảng */}
        <div
          className="css-grid-table-body"
          style={loading || employees.length === 0 ? { gridTemplateColumns: '100%' } : undefined}
        >
          {loading ? (
            <div className="text-center" style={{ padding: '24px', gridColumn: '1 / -1', borderLeft: 'none' }}>
              読み込み中...
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center" style={{ padding: '24px', gridColumn: '1 / -1', borderLeft: 'none' }}>
              検索条件に該当するユーザが見つかりません。
            </div>
          ) : (
            employees.map((emp) => (
              <React.Fragment key={emp.employeeId}>
                <div className="bor-l-none text-center">
                  <Link href={getDetailUrl(emp.employeeId)}>{emp.employeeId}</Link>
                </div>
                <div>{emp.employeeName}</div>
                <div>{formatDate(emp.employeeBirthDate)}</div>
                <div>{emp.departmentName || ''}</div>
                <div>{emp.employeeEmail || ''}</div>
                <div>{emp.employeeTelephone || ''}</div>
                <div>{emp.certificationName || ''}</div>
                <div>{formatDate(emp.endDate)}</div>
                <div>{emp.score !== null && emp.score !== undefined ? emp.score : ''}</div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
