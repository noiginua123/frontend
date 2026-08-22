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

const INITIAL_PRIORITY_SORT_FIELD: SortField = 'employeeName';

/**
 * Cấu hình sắp xếp: cột ưu tiên (sort chính) + chiều sắp xếp của cả 3 cột.
 * Gộp vào một state để quyết định toggle/switch luôn dựa trên trạng thái mới nhất.
 */
interface SortConfig {
  prioritySortField: SortField;
  sortState: SortState;
}

const INITIAL_SORT_CONFIG: SortConfig = {
  prioritySortField: INITIAL_PRIORITY_SORT_FIELD,
  sortState: INITIAL_SORT_STATE,
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
 * Tạo trạng thái sắp xếp mới cho cột được người dùng lựa chọn (đảo chiều cột đó).
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
 * Tính cấu hình sắp xếp kế tiếp theo mô hình ưu tiên động:
 * - Cột vừa được bấm sẽ trở thành cột ưu tiên chính (prioritySortField).
 * - Cột vừa bấm luôn được đảo chiều (ASC <-> DESC) so với trạng thái hiện tại của nó.
 * - Hai cột còn lại giữ nguyên chiều sắp xếp đang lưu trong sortState.
 *
 * @param previous Cấu hình sắp xếp hiện tại
 * @param field Cột người dùng vừa bấm
 * @return Cấu hình sắp xếp sau khi cập nhật
 */
function createNextSortConfig(
  previous: SortConfig,
  field: SortField,
): SortConfig {
  return {
    prioritySortField: field,
    sortState: createNextSortState(previous.sortState, field),
  };
}

/**
 * Tạo danh sách các trang hiển thị theo quy chuẩn thiết kế:
 * - Luôn hiển thị button trang đầu tiên (1) và trang cuối cùng (totalPages).
 * - Hiển thị trang hiện tại, kèm trang ngay trước và trang ngay sau.
 * - Ví dụ: đang ở trang 5 / tổng 15 trang => < 1 ... 4 5 6 ... 15 >
 *
 * @param currentPage Trang hiện tại
 * @param totalPages Tổng số trang
 * @return Mảng các số trang hiển thị
 */
function createVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 1) {
    return [1];
  }
  const pages = new Set<number>();
  pages.add(1);
  if (currentPage - 1 >= 1) {
    pages.add(currentPage - 1);
  }
  pages.add(currentPage);
  if (currentPage + 1 <= totalPages) {
    pages.add(currentPage + 1);
  }
  pages.add(totalPages);
  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Quản lý dữ liệu, tìm kiếm, sắp xếp ưu tiên động và phân trang của màn hình ADM002.
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
  const [sortConfig, setSortConfig] = useState<SortConfig>(INITIAL_SORT_CONFIG);

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
   * Lấy danh sách nhân viên theo điều kiện tìm kiếm, cấu hình sắp xếp và trang hiện tại.
   * Cột prioritySortField là sort chính; hai cột còn lại giữ chiều đang lưu làm sort phụ.
   *
   * @param filter Điều kiện tìm kiếm nhân viên
   * @param currentSortConfig Cấu hình sắp xếp hiện tại
   * @param page Trang cần lấy dữ liệu
   */
  const fetchEmployees = useCallback(async (
    filter: EmployeeSearchFilter,
    currentSortConfig: SortConfig,
    page: number,
  ) => {
    setLoading(true);
    setEmployeeError(null);

    const params: GetEmployeesParams = {
      offset: (page - 1) * ADM002_PAGE_SIZE,
      limit: ADM002_PAGE_SIZE,
      priority_sort: currentSortConfig.prioritySortField,
      ord_employee_name: currentSortConfig.sortState.ordEmployeeName,
      ord_certification_name: currentSortConfig.sortState.ordCertificationName,
      ord_end_date: currentSortConfig.sortState.ordEndDate,
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

  // Tải phòng ban một lần khi mount.
  useEffect(() => {
    void fetchDepartments();
  }, [fetchDepartments]);

  // Tải danh sách nhân viên mỗi khi filter/sắp xếp/trang thay đổi.
  // Luôn dùng state đã commit mới nhất -> không còn stale closure.
  useEffect(() => {
    void fetchEmployees(searchParams, sortConfig, currentPage);
  }, [fetchEmployees, searchParams, sortConfig, currentPage]);

  /**
   * Áp dụng điều kiện tìm kiếm mới và quay về trang đầu tiên.
   *
   * @param filter Điều kiện tìm kiếm mới
   */
  const handleSearch = useCallback((filter: EmployeeSearchFilter) => {
    setSearchParams(filter);
    setCurrentPage(1);
  }, []);

  /**
   * Thay đổi sắp xếp theo mô hình ưu tiên động và quay về trang đầu tiên.
   * Dùng functional update để luôn tính từ trạng thái mới nhất (tránh stale closure).
   *
   * @param field Cột được người dùng lựa chọn để sắp xếp
   */
  const handleSort = useCallback((field: SortField) => {
    setSortConfig((previous) => createNextSortConfig(previous, field));
    setCurrentPage(1);
  }, []);

  /**
   * Chuyển đến trang được lựa chọn.
   *
   * @param page Trang cần chuyển đến
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage((current) => (page === current ? current : page));
  }, []);

  const totalPages = Math.ceil(totalRecords / ADM002_PAGE_SIZE);
  const visiblePages = createVisiblePages(currentPage, totalPages);

  return {
    departments,
    employees,
    totalRecords,
    totalPages,
    visiblePages,
    currentPage,
    loading,
    departmentError,
    employeeError,
    searchParams,
    sortState: sortConfig.sortState,
    prioritySortField: sortConfig.prioritySortField,
    handleSearch,
    handleSort,
    handlePageChange,
  };
}
