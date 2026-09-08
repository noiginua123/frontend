'use client';

import React, { Fragment } from 'react';
import Link from 'next/link';
import { useADM002 } from '@/hooks/useADM002';
import {
  ADM002_MESSAGES,
  ADM002_SORT_FIELDS,
  EMPLOYEE_NAME_MAX_LENGTH,
} from '@/constants/adm002';
import { formatEmployeeDate, truncateEmployeeName } from '@/utils/employee';

/**
 * Component quản lý toàn bộ giao diện màn hình danh sách nhân viên ADM002.
 * Gồm form tìm kiếm nhân viên, nút thêm mới, bảng danh sách nhân viên và phân trang.
 */
export default function ADM002() {
  const {
    departments,
    employees,
    totalPages,
    visiblePages,
    currentPage,
    loading,
    departmentError,
    employeeError,
    sortState,
    prioritySortField,
    register,
    errors,
    onSearchSubmit,
    getHref,
    renderSortLabel,
    handleSort,
    handlePageChange,
    handleNavigateToAdd,
    handleViewDetail,
  } = useADM002();

  return (
    <>
      {/* 1. Phần form tìm kiếm nhân viên */}
      <div className="search-memb">
        <h1 className="title">会員名称で会員を検索します。検索条件無しの場合は全て表示されます。</h1>
        {departmentError && (
          <div className="box-err-content adm002-error-message">
            {departmentError}
          </div>
        )}
        <form className="c-form" onSubmit={onSearchSubmit}>
          <ul className="d-flex">
            <li className="form-group row">
              <label className="col-form-label">氏名:</label>
              <div className="col-sm">
                <input
                  type="text"
                  autoFocus
                  maxLength={EMPLOYEE_NAME_MAX_LENGTH}
                  aria-invalid={Boolean(errors.fullname)}
                  {...register('fullname')}
                />
                {errors.fullname && (
                  <div className="box-err-content adm002-field-error">
                    {errors.fullname.message}
                  </div>
                )}
              </div>
            </li>
            <li className="form-group row">
              <label className="col-form-label">グループ:</label>
              <div className="col-sm">
                <select {...register('departmentId')}>
                  <option value="">全て</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>
            </li>
            <li className="form-group row">
              <div className="btn-group">
                <button type="submit" className="btn btn-primary btn-sm">
                  検索
                </button>
                <button
                  type="button"
                  onClick={handleNavigateToAdd}
                  className="btn btn-secondary btn-sm"
                >
                  新規追加
                </button>
              </div>
            </li>
          </ul>
        </form>
      </div>

      {/* 2. Phần bảng danh sách nhân viên và phân trang */}
      <div className="row row-table">
        <div className="css-grid-table box-shadow">
          {/* Table Header */}
          <div className="css-grid-table-header">
            <div>ID</div>
            <div
              className={`sort-header-button ${prioritySortField === ADM002_SORT_FIELDS.EMPLOYEE_NAME ? 'font-weight-bold text-dark' : ''}`}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                fontWeight: prioritySortField === ADM002_SORT_FIELDS.EMPLOYEE_NAME ? 'bold' : 'normal',
              }}
              onClick={() => void handleSort(ADM002_SORT_FIELDS.EMPLOYEE_NAME)}
            >
              {renderSortLabel('氏名', sortState.ordEmployeeName)}
            </div>
            <div>生年月日</div>
            <div>グループ</div>
            <div>メールアドレス</div>
            <div>電話番号</div>
            <div
              className={`sort-header-button ${prioritySortField === ADM002_SORT_FIELDS.CERTIFICATION_NAME ? 'font-weight-bold text-dark' : ''}`}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                fontWeight: prioritySortField === ADM002_SORT_FIELDS.CERTIFICATION_NAME ? 'bold' : 'normal',
              }}
              onClick={() => void handleSort(ADM002_SORT_FIELDS.CERTIFICATION_NAME)}
            >
              {renderSortLabel('日本語能力', sortState.ordCertificationName)}
            </div>
            <div
              className={`sort-header-button ${prioritySortField === ADM002_SORT_FIELDS.END_DATE ? 'font-weight-bold text-dark' : ''}`}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                fontWeight: prioritySortField === ADM002_SORT_FIELDS.END_DATE ? 'bold' : 'normal',
              }}
              onClick={() => void handleSort(ADM002_SORT_FIELDS.END_DATE)}
            >
              {renderSortLabel('失効日', sortState.ordEndDate)}
            </div>
            <div>点数</div>
          </div>

          {/* Loading / Error / Empty States */}
          {loading && (
            <div className="p-3" style={{ gridColumn: '1 / -1', padding: '16px' }}>
              {ADM002_MESSAGES.loading}
            </div>
          )}
          {!loading && employeeError && (
            <div className="p-3 text-danger box-err-content adm002-error-message" style={{ gridColumn: '1 / -1', margin: '16px' }}>
              {employeeError}
            </div>
          )}
          {!loading && !employeeError && employees.length === 0 && (
            <div className="p-3" style={{ gridColumn: '1 / -1', padding: '16px', textAlign: 'center' }}>
              {ADM002_MESSAGES.employeeNotFound}
            </div>
          )}

          {/* Table Body */}
          {!loading && !employeeError && employees.length > 0 && (
            <div className="css-grid-table-body">
              {employees.map((e, index) => (
                <Fragment
                  key={`${e.employeeId}-${e.certificationName ?? 'none'}-${e.endDate ?? 'none'}-${index}`}
                >
                  <div className="bor-l-none text-center">
                    <Link
                      href={getHref(e.employeeId)}
                      onClick={(event) => {
                        event.preventDefault();
                        handleViewDetail(e.employeeId);
                      }}
                      className="no-underline text-black hover-primary"
                    >
                      {e.employeeId}
                    </Link>
                  </div>
                  <div title={e.employeeName}>{truncateEmployeeName(e.employeeName)}</div>
                  <div>{formatEmployeeDate(e.employeeBirthDate)}</div>
                  <div>{e.departmentName ?? ''}</div>
                  <div title={e.employeeEmail ?? ''}>{truncateEmployeeName(e.employeeEmail)}</div>
                  <div>{e.employeeTelephone ?? ''}</div>
                  <div title={e.certificationName ?? ''}>{truncateEmployeeName(e.certificationName)}</div>
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
                onClick={() => void handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                &lt;
              </button>
              {visiblePages.map((page, index) => {
                const previousPage = visiblePages[index - 1];
                const showEllipsis = previousPage && page - previousPage > 1;

                return (
                  <Fragment key={page}>
                    {showEllipsis && <span className="btn-disabled">...</span>}
                    <button
                      type="button"
                      className={`btn btn-sm btn-falcon-default ${currentPage === page ? 'active' : ''}`}
                      onClick={() => void handlePageChange(page)}
                      disabled={currentPage === page || loading}
                    >
                      {page}
                    </button>
                  </Fragment>
                );
              })}
              <button
                type="button"
                className="btn btn-sm btn-next btn-falcon-default"
                onClick={() => void handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
