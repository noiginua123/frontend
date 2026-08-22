'use client';

import { useAuth } from '@/hooks/useAuth';
import { useADM002 } from '@/hooks/useADM002';
import { EmployeeListForm } from '@/components/employee/EmployeeListForm';
import { EmployeeTable } from '@/components/employee/EmployeeTable';

/**
 * Component trang hiển thị danh sách nhân viên ADM002.
 *
 * @return Giao diện trang danh sách nhân viên
 */
export default function EmployeeListPage() {
  useAuth();
  const {
    departments,
    employees,
    totalPages,
    visiblePages,
    currentPage,
    loading,
    departmentError,
    employeeError,
    searchParams,
    sortState,
    prioritySortField,
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
        isLoading={loading}
        errorMessage={employeeError}
        currentPage={currentPage}
        totalPages={totalPages}
        visiblePages={visiblePages}
        employeeNameSort={sortState.ordEmployeeName}
        certificationSort={sortState.ordCertificationName}
        endDateSort={sortState.ordEndDate}
        prioritySortField={prioritySortField}
        onPageChange={handlePageChange}
        onSortChange={handleSort}
      />
    </>
  );
}
