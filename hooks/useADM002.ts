import { useState, useEffect, useCallback } from 'react';
import { getDepartments, getEmployees, GetEmployeesParams } from '@/lib/api/employee.api';
import { DepartmentDTO, EmployeeListDTO, SortState } from '@/types/employee';

export interface SearchFilter {
  fullname: string;
  departmentId: string;
}

export type SortField = 'employeeName' | 'certificationName' | 'endDate';

export const INITIAL_SORT_STATE: SortState = {
  ordEmployeeName: 'ASC',
  ordCertificationName: 'ASC',
  ordEndDate: 'ASC',
};

export function useADM002() {
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeListDTO[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Điều kiện tìm kiếm
  const [searchParams, setSearchParams] = useState<SearchFilter>({
    fullname: '',
    departmentId: '',
  });

  // Trạng thái sắp xếp của từng cột (mặc định cả 3 cột đều = ASC để render icon ▲▽)
  const [sortState, setSortState] = useState<SortState>(INITIAL_SORT_STATE);

  // Cột đang được active sort gần nhất (mặc định sắp xếp theo tên nhân viên)
  const [activeSortField, setActiveSortField] = useState<SortField>('employeeName');

  // Nạp danh sách phòng ban thông qua API layer
  const fetchDepartments = useCallback(async () => {
    try {
      const data = await getDepartments();
      if (data && data.departments) {
        setDepartments(data.departments);
      }
    } catch {
      setError('部門を取得できません');
    }
  }, []);

  // Gọi API lấy danh sách nhân viên theo điều kiện tìm kiếm và cột đang active sort
  const fetchEmployees = useCallback(async (filter: SearchFilter, sort: SortState, activeField: SortField) => {
    setLoading(true);
    setError(null);
    try {
      // Chỉ gửi param sort của cột đang được click/active để Backend ưu tiên sort đúng cột đó
      const params: GetEmployeesParams = {
        offset: 0,
        limit: 20,
        ord_employee_name: activeField === 'employeeName' ? sort.ordEmployeeName : '',
        ord_certification_name: activeField === 'certificationName' ? sort.ordCertificationName : '',
        ord_end_date: activeField === 'endDate' ? sort.ordEndDate : '',
      };

      if (filter.fullname.trim()) {
        params.employee_name = filter.fullname.trim();
      }

      if (filter.departmentId) {
        params.department_id = filter.departmentId;
      }

      const data = await getEmployees(params);
      if (data) {
        setEmployees(data.employees || []);
        setTotalRecords(data.totalRecords || 0);
      }
    } catch {
      setError('従業員を取得できません');
      setEmployees([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Xử lý khi nhấn nút Tìm kiếm (giữ nguyên cột active sort hiện tại)
  const handleSearch = useCallback((filter: SearchFilter) => {
    setSearchParams(filter);
    fetchEmployees(filter, sortState, activeSortField);
  }, [fetchEmployees, sortState, activeSortField]);

  // Xử lý khi click vào cột Sort trên Header bảng
  const handleSort = useCallback((field: SortField) => {
    setActiveSortField(field);
    setSortState((prevSort) => {
      let nextSort: SortState;
      if (field === 'employeeName') {
        nextSort = {
          ...prevSort,
          ordEmployeeName: prevSort.ordEmployeeName === 'ASC' ? 'DESC' : 'ASC',
        };
      } else if (field === 'certificationName') {
        nextSort = {
          ...prevSort,
          ordCertificationName: prevSort.ordCertificationName === 'ASC' ? 'DESC' : 'ASC',
        };
      } else {
        nextSort = {
          ...prevSort,
          ordEndDate: prevSort.ordEndDate === 'ASC' ? 'DESC' : 'ASC',
        };
      }

      // Gọi API với trạng thái sort mới cho cột được click
      fetchEmployees(searchParams, nextSort, field);
      return nextSort;
    });
  }, [fetchEmployees, searchParams]);

  // Khởi tạo ban đầu
  useEffect(() => {
    fetchDepartments();
    fetchEmployees({ fullname: '', departmentId: '' }, INITIAL_SORT_STATE, 'employeeName');
  }, [fetchDepartments, fetchEmployees]);

  return {
    departments,
    employees,
    totalRecords,
    loading,
    error,
    searchParams,
    sortState,
    activeSortField,
    handleSearch,
    handleSort,
  };
}
