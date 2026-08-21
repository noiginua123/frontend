'use client';

import { useAuth } from '@/hooks/useAuth';
import { useADM002 } from '@/hooks/useADM002';
import { EmployeeListForm } from '@/components/employee/EmployeeListForm';
import { EmployeeTable } from '@/components/employee/EmployeeTable';

export default function EmployeeListPage() {
  useAuth();
  const {
    departments,
    employees,
    loading,
    error,
    searchParams,
    sortState,
    handleSearch,
    handleSort,
  } = useADM002();

  return (
    <>
      <EmployeeListForm
        departments={departments}
        onSearch={handleSearch}
        initialFullname={searchParams.fullname}
        initialDepartmentId={searchParams.departmentId}
      />
      <EmployeeTable
        employees={employees}
        loading={loading}
        error={error}
        searchParams={searchParams}
        sortState={sortState}
        onSort={handleSort}
      />
    </>
  );
}
