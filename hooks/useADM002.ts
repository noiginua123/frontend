import { useCallback, useEffect, useState } from 'react';
import {
  ADM002_MESSAGES,
  ADM002_PAGE_SIZE,
} from '@/constants/adm002';
import {
  getDepartments,
  getEmployees,
  GetEmployeesParams,
} from '@/lib/api/employee.api';
import {
  DepartmentDTO,
  EmployeeListDTO,
  EmployeeSearchFilter,
  SortField,
  SortOrder,
  SortState,
} from '@/types/employee';

const INITIAL_SEARCH_FILTER: EmployeeSearchFilter = {
  fullname: '',
  departmentId: '',
};

export const INITIAL_SORT_STATE: SortState = {
  ordEmployeeName: 'ASC',
  ordCertificationName: 'ASC',
  ordEndDate: 'ASC',
};

/**
 * Đảo chiều sắp xếp giữa tăng dần và giảm dần.
 *
 * @param sortOrder Chiều sắp xếp hiện tại
 * @return Chiều sắp xếp tiếp theo
 */
function toggleSortOrder(sortOrder: SortOrder): SortOrder {
  return sortOrder === 'ASC' ? 'DESC' : 'ASC';
}

/**
 * Tạo trạng thái sắp xếp mới cho cột được người dùng lựa chọn.
 *
 * @param currentSortState Trạng thái sắp xếp hiện tại
 * @param field Cột cần thay đổi chiều sắp xếp
 * @return Trạng thái sắp xếp sau khi cập nhật
 */
function createNextSortState(
  currentSortState: SortState,
  field: SortField,
): SortState {
  if (field === 'employeeName') {
    return {
      ...currentSortState,
      ordEmployeeName: toggleSortOrder(currentSortState.ordEmployeeName),
    };
  }

  if (field === 'certificationName') {
    return {
      ...currentSortState,
      ordCertificationName: toggleSortOrder(
        currentSortState.ordCertificationName,
      ),
    };
  }

  return {
    ...currentSortState,
    ordEndDate: toggleSortOrder(currentSortState.ordEndDate),
  };
}

/**
 * Quản lý dữ liệu, tìm kiếm, sắp xếp và phân trang của màn hình ADM002.
 *
 * @return Trạng thái màn hình và các hàm xử lý của ADM002
 */
export function useADM002() {
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeListDTO[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<EmployeeSearchFilter>(
    INITIAL_SEARCH_FILTER,
  );
  const [sortState, setSortState] = useState<SortState>(INITIAL_SORT_STATE);
  const [activeSortField, setActiveSortField] =
    useState<SortField>('employeeName');

  /**
   * Lấy danh sách phòng ban dùng cho điều kiện tìm kiếm.
   */
  const fetchDepartments = useCallback(async () => {
    setDepartmentError(null);
    try {
      const response = await getDepartments();
      setDepartments(response.departments ?? []);
    } catch {
      setDepartments([]);
      setDepartmentError(ADM002_MESSAGES.departmentLoadError);
    }
  }, []);

  /**
   * Lấy danh sách nhân viên theo điều kiện tìm kiếm, sắp xếp và trang hiện tại.
   *
   * @param filter Điều kiện tìm kiếm nhân viên
   * @param currentSortState Trạng thái chiều sắp xếp của các cột
   * @param currentActiveSortField Cột đang được dùng để sắp xếp
   * @param page Trang cần lấy dữ liệu
   */
  const fetchEmployees = useCallback(async (
    filter: EmployeeSearchFilter,
    currentSortState: SortState,
    currentActiveSortField: SortField,
    page: number,
  ) => {
    setLoading(true);
    setEmployeeError(null);

    const params: GetEmployeesParams = {
      offset: (page - 1) * ADM002_PAGE_SIZE,
      limit: ADM002_PAGE_SIZE,
      ord_employee_name:
        currentActiveSortField === 'employeeName'
          ? currentSortState.ordEmployeeName
          : '',
      ord_certification_name:
        currentActiveSortField === 'certificationName'
          ? currentSortState.ordCertificationName
          : '',
      ord_end_date:
        currentActiveSortField === 'endDate'
          ? currentSortState.ordEndDate
          : '',
    };

    const normalizedFullname = filter.fullname.trim();
    if (normalizedFullname) {
      params.employee_name = normalizedFullname;
    }
    if (filter.departmentId) {
      params.department_id = filter.departmentId;
    }

    try {
      const response = await getEmployees(params);
      setEmployees(response.employees ?? []);
      setTotalRecords(response.totalRecords ?? 0);
    } catch {
      setEmployeeError(ADM002_MESSAGES.employeeLoadError);
      setEmployees([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Áp dụng điều kiện tìm kiếm mới và tải lại dữ liệu từ trang đầu tiên.
   *
   * @param filter Điều kiện tìm kiếm mới
   */
  const handleSearch = useCallback((filter: EmployeeSearchFilter) => {
    const firstPage = 1;
    setSearchParams(filter);
    setCurrentPage(firstPage);
    void fetchEmployees(
      filter,
      sortState,
      activeSortField,
      firstPage,
    );
  }, [activeSortField, fetchEmployees, sortState]);

  /**
   * Thay đổi chiều sắp xếp của cột được chọn và tải lại trang đầu tiên.
   *
   * @param field Cột được người dùng lựa chọn để sắp xếp
   */
  const handleSort = useCallback((field: SortField) => {
    const firstPage = 1;
    const nextSortState = createNextSortState(sortState, field);

    setSortState(nextSortState);
    setActiveSortField(field);
    setCurrentPage(firstPage);
    void fetchEmployees(searchParams, nextSortState, field, firstPage);
  }, [fetchEmployees, searchParams, sortState]);

  /**
   * Tải danh sách nhân viên của trang được lựa chọn.
   *
   * @param page Trang cần chuyển đến
   */
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage) {
      return;
    }

    setCurrentPage(page);
    void fetchEmployees(searchParams, sortState, activeSortField, page);
  }, [activeSortField, currentPage, fetchEmployees, searchParams, sortState]);

  useEffect(() => {
    void fetchDepartments();
    void fetchEmployees(
      INITIAL_SEARCH_FILTER,
      INITIAL_SORT_STATE,
      'employeeName',
      1,
    );
  }, [fetchDepartments, fetchEmployees]);

  return {
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
  };
}
