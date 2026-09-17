'use client';

import React, { Fragment } from 'react';
import Link from 'next/link';
import { useADM002 } from '@/hooks/useADM002';
import {
  ADM002_MESSAGES,
  ADM002_SORT_FIELDS,
  BUTTON_LABELS,
  EMPLOYEE_NAME_MAX_LENGTH,
  FIELD_LABELS,
  SCREEN_TITLES,
  SELECT_OPTIONS,
  TABLE_COLUMN_HEADERS,
} from '@/constants';
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
        <h1 className="title">{SCREEN_TITLES.ADM002_SEARCH_GUIDE}</h1>
        {departmentError && (
          <div className="box-err-content adm002-error-message">
            {departmentError}
          </div>
        )}
        <form className="c-form" onSubmit={onSearchSubmit}>
          <ul className="d-flex">
            <li className="form-group row">
              <label className="col-form-label">{`${FIELD_LABELS.FULLNAME}:`}</label>
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
              <label className="col-form-label">{`${FIELD_LABELS.GROUP}:`}</label>
              <div className="col-sm">
                <select {...register('departmentId')}>
                  <option value="">{SELECT_OPTIONS.ALL}</option>
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
                  {BUTTON_LABELS.SEARCH}
                </button>
                <button
                  type="button"
                  onClick={handleNavigateToAdd}
                  className="btn btn-secondary btn-sm"
                >
                  {BUTTON_LABELS.ADD_NEW}
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
            <div>{TABLE_COLUMN_HEADERS.ID}</div>
            <div
              className={`sort-header-button ${prioritySortField === ADM002_SORT_FIELDS.EMPLOYEE_NAME ? 'font-weight-bold text-dark' : ''}`}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                fontWeight: prioritySortField === ADM002_SORT_FIELDS.EMPLOYEE_NAME ? 'bold' : 'normal',
              }}
              onClick={() => void handleSort(ADM002_SORT_FIELDS.EMPLOYEE_NAME)}
            >
              {renderSortLabel(TABLE_COLUMN_HEADERS.FULLNAME, sortState.ordEmployeeName)}
            </div>
            <div>{TABLE_COLUMN_HEADERS.BIRTH_DATE}</div>
            <div>{TABLE_COLUMN_HEADERS.GROUP}</div>
            <div>{TABLE_COLUMN_HEADERS.EMAIL}</div>
            <div>{TABLE_COLUMN_HEADERS.TEL}</div>
            <div
              className={`sort-header-button ${prioritySortField === ADM002_SORT_FIELDS.CERTIFICATION_NAME ? 'font-weight-bold text-dark' : ''}`}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                fontWeight: prioritySortField === ADM002_SORT_FIELDS.CERTIFICATION_NAME ? 'bold' : 'normal',
              }}
              onClick={() => void handleSort(ADM002_SORT_FIELDS.CERTIFICATION_NAME)}
            >
              {renderSortLabel(TABLE_COLUMN_HEADERS.JAPANESE_LEVEL, sortState.ordCertificationName)}
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
              {renderSortLabel(TABLE_COLUMN_HEADERS.END_DATE, sortState.ordEndDate)}
            </div>
            <div>{TABLE_COLUMN_HEADERS.SCORE}</div>
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
                  <div title={e.departmentName ?? ''}>{truncateEmployeeName(e.departmentName)}</div>
                  <div title={e.employeeEmail ?? ''}>{truncateEmployeeName(e.employeeEmail)}</div>
                  <div title={e.employeeTelephone ?? ''}>{truncateEmployeeName(e.employeeTelephone)}</div>
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
                aria-label="Previous page"
              >
                <svg
                  className="svg-inline--fa fa-chevron-left fa-w-10"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="chevron-left"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 320 512"
                >
                  <path
                    fill="currentColor"
                    d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
                  />
                </svg>
              </button>
              {visiblePages.map((page, index) => {
                const previousPage = visiblePages[index - 1];
                const showEllipsis = previousPage && page - previousPage > 1;

                return (
                  <Fragment key={page}>
                    {showEllipsis && (
                      <span
                        className="btn btn-sm text-primary btn-falcon-default pagin-ellipsis"
                        aria-hidden="true"
                      >
                        <svg
                          className="svg-inline--fa fa-ellipsis-h fa-w-16"
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="fas"
                          data-icon="ellipsis-h"
                          role="img"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path
                            fill="currentColor"
                            d="M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"
                          />
                        </svg>
                      </span>
                    )}
                    <button
                      type="button"
                      className={`btn btn-sm ${currentPage === page ? 'btn-active active' : 'text-primary btn-falcon-default'}`}
                      onClick={() => void handlePageChange(page)}
                      disabled={currentPage === page || loading}
                      aria-current={currentPage === page ? 'page' : undefined}
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
                aria-label="Next page"
              >
                <svg
                  className="svg-inline--fa fa-chevron-right fa-w-10"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="chevron-right"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 320 512"
                >
                  <path
                    fill="currentColor"
                    d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
