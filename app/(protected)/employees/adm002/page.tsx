'use client';

import { useAuth } from '@/hooks/useAuth';
import { useADM002 } from '@/hooks/useADM002';
import { EmployeeListForm } from '@/components/employee/EmployeeListForm';
import { EmployeeTable } from '@/components/employee/EmployeeTable';
import { EmployeePagination } from '@/components/employee/EmployeePagination';

/**
 * Hiển thị màn hình tìm kiếm và danh sách nhân viên ADM002.
 *
 * @return Giao diện màn hình ADM002
 */
export default function EmployeeListPage() {
  useAuth();
  const {
    departments,
    employees,
    totalRecords,
    currentPage,
    loading,
    departmentError,
    employeeError,
    searchParams,
    sortState,
    activeSortField,
    handleSearch,
    handleSort,
    handlePageChange,
  } = useADM002();

  return (
    <>
      <EmployeeListForm
        departments={departments}
        departmentError={departmentError}
        onSearch={handleSearch}
        initialFullname={searchParams.fullname}
        initialDepartmentId={searchParams.departmentId}
      />
      <EmployeeTable
        employees={employees}
        loading={loading}
        error={employeeError}
        currentPage={currentPage}
        searchParams={searchParams}
        sortState={sortState}
        activeSortField={activeSortField}
        onSort={handleSort}
      />
      <EmployeePagination
        currentPage={currentPage}
        totalRecords={totalRecords}
        onPageChange={handlePageChange}
      />
    </>
  );
}
