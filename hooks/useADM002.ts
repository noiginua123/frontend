import { useCallback, useEffect, useState } from 'react';
import {
  ADM002_MESSAGES,
  ADM002_PAGE_SIZE,
  ADM002_SESSION_KEY,
} from '@/constants/adm002';
import { SORT_ORDER, SortOrder } from '@/constants/sort';
import { getDepartments } from '@/lib/api/department.api';
import { getEmployees } from '@/lib/api/employee.api';
import { DepartmentDTO } from '@/types/department';
import {
  EmployeeListDTO,
  EmployeeSearchFilter,
  EmployeeSortConfig,
  SortField,
  SortState,
} from '@/types/employee';
import { buildEmployeeQueryParams } from '@/utils/employee-query';
import { createVisiblePages } from '@/utils/pagination';

const INITIAL_SEARCH_FILTER: EmployeeSearchFilter = {
  fullname: '',
  departmentId: '',
};

export const INITIAL_SORT_STATE: SortState = {
  ordEmployeeName: SORT_ORDER.ASC,
  ordCertificationName: SORT_ORDER.ASC,
  ordEndDate: SORT_ORDER.ASC,
};

const INITIAL_PRIORITY_SORT_FIELD: SortField = 'employeeName';

/**
 * Cấu hình sắp xếp: cột ưu tiên (sort chính) + chiều sắp xếp của cả 3 cột.
 * Gộp vào một state để quyết định toggle/switch luôn dựa trên trạng thái mới nhất.
 */
const INITIAL_SORT_CONFIG: EmployeeSortConfig = {
  prioritySortField: INITIAL_PRIORITY_SORT_FIELD,
  sortState: INITIAL_SORT_STATE,
};

/**
 * Trạng thái bộ lọc và phân trang ADM002 được lưu vào sessionStorage.
 */
export interface ADM002SessionState {
  currentPage: number;
  searchParams: EmployeeSearchFilter;
  sortConfig: EmployeeSortConfig;
}

/**
 * Đọc trạng thái ADM002 đã lưu từ sessionStorage (nếu có).
 *
 * @return Trạng thái ADM002 đã lưu hoặc null nếu không tồn tại
 */
function loadStoredADM002State(): ADM002SessionState | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(ADM002_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ADM002SessionState>;
      if (parsed && typeof parsed === 'object') {
        return {
          currentPage:
            typeof parsed.currentPage === 'number' && parsed.currentPage >= 1
              ? parsed.currentPage
              : 1,
          searchParams: {
            fullname:
              typeof parsed.searchParams?.fullname === 'string'
                ? parsed.searchParams.fullname
                : '',
            departmentId:
              typeof parsed.searchParams?.departmentId === 'string'
                ? parsed.searchParams.departmentId
                : '',
          },
          sortConfig: {
            prioritySortField:
              parsed.sortConfig?.prioritySortField ?? INITIAL_PRIORITY_SORT_FIELD,
            sortState: {
              ordEmployeeName:
              parsed.sortConfig?.sortState?.ordEmployeeName === SORT_ORDER.DESC
                  ? SORT_ORDER.DESC
                  : SORT_ORDER.ASC,
              ordCertificationName:
              parsed.sortConfig?.sortState?.ordCertificationName === SORT_ORDER.DESC
                  ? SORT_ORDER.DESC
                  : SORT_ORDER.ASC,
              ordEndDate:
              parsed.sortConfig?.sortState?.ordEndDate === SORT_ORDER.DESC
                  ? SORT_ORDER.DESC
                  : SORT_ORDER.ASC,
            },
          },
        };
      }
    }
  } catch {
    // Bỏ qua lỗi sessionStorage
  }
  return null;
}

/**
 * Đảo chiều sắp xếp giữa tăng dần và giảm dần.
 *
 * @param sortOrder Chiều sắp xếp hiện tại
 * @return Chiều sắp xếp tiếp theo
 */
function toggleSortOrder(sortOrder: SortOrder): SortOrder {
  return sortOrder === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC;
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
  previous: EmployeeSortConfig,
  field: SortField,
): EmployeeSortConfig {
  return {
    prioritySortField: field,
    sortState: createNextSortState(previous.sortState, field),
  };
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
  const [loading, setLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const stored = loadStoredADM002State();
    return stored ? stored.currentPage : 1;
  });

  const [searchParams, setSearchParams] = useState<EmployeeSearchFilter>(() => {
    const stored = loadStoredADM002State();
    return stored ? stored.searchParams : INITIAL_SEARCH_FILTER;
  });

  const [sortConfig, setSortConfig] = useState<EmployeeSortConfig>(() => {
    const stored = loadStoredADM002State();
    return stored ? stored.sortConfig : INITIAL_SORT_CONFIG;
  });

  // Tự động lưu trạng thái tìm kiếm, phân trang và sắp xếp vào sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stateToSave: ADM002SessionState = {
        currentPage,
        searchParams,
        sortConfig,
      };
      window.sessionStorage.setItem(
        ADM002_SESSION_KEY,
        JSON.stringify(stateToSave),
      );
    } catch {
      // Bỏ qua lỗi sessionStorage quota
    }
  }, [currentPage, searchParams, sortConfig]);

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
    currentSortConfig: EmployeeSortConfig,
    page: number,
  ) => {
    setLoading(true);
    setEmployeeError(null);

    const params = buildEmployeeQueryParams(filter, currentSortConfig, page);

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
