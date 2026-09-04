import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ADM002_MESSAGES,
  ADM002_PAGE_SIZE,
} from '@/constants/adm002';
import { ADM004_ROUTES } from '@/constants/adm004';
import { clearEmployeeFormData } from '@/utils/employeeForm';
import { getDepartments } from '@/lib/api/department.api';
import { getEmployees } from '@/lib/api/employee.api';
import { DepartmentDTO } from '@/types/department';
import {
  EmployeeListDTO,
  EmployeeSearchFilter,
  EmployeeSortConfig,
  SortField,
} from '@/types/employee';
import {
  createNextSortConfig,
  INITIAL_SORT_CONFIG,
  INITIAL_SORT_STATE,
} from '@/utils/sort';
import {
  ADM002SessionState,
  loadStoredADM002State,
  saveStoredADM002State,
} from '@/utils/storage';
import { buildEmployeeQueryParams } from '@/utils/query';
import { createVisiblePages } from '@/utils/pagination';

export { INITIAL_SORT_STATE };
export type { ADM002SessionState };

const INITIAL_SEARCH_FILTER: EmployeeSearchFilter = {
  fullname: '',
  departmentId: '',
};

/**
 * Custom Hook quản lý dữ liệu, tìm kiếm, phân trang và sắp xếp màn hình ADM002.
 *
 * @return Trạng thái màn hình và các hàm xử lý sự kiện
 */
export function useADM002() {
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeListDTO[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchParams, setSearchParams] = useState<EmployeeSearchFilter>(INITIAL_SEARCH_FILTER);
  const [sortConfig, setSortConfig] = useState<EmployeeSortConfig>(INITIAL_SORT_CONFIG);
  const [isRestored, setIsRestored] = useState<boolean>(false);

  // Khôi phục trạng thái bộ lọc từ sessionStorage sau khi mount trên Client
  useEffect(() => {
    const stored = loadStoredADM002State();
    if (stored) {
      setCurrentPage(stored.currentPage);
      setSearchParams(stored.searchParams);
      setSortConfig(stored.sortConfig);
    }
    setIsRestored(true);
  }, []);

  // Tự động đồng bộ state vào sessionStorage khi có thay đổi
  useEffect(() => {
    if (isRestored) {
      saveStoredADM002State({
        currentPage,
        searchParams,
        sortConfig,
      });
    }
  }, [currentPage, searchParams, sortConfig, isRestored]);

  /**
   * Gọi API lấy danh sách phòng ban cho dropdown tìm kiếm.
   */
  const fetchDepartments = useCallback(async (): Promise<void> => {
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
   * Gọi API lấy danh sách nhân viên theo điều kiện lọc, sắp xếp và phân trang.
   *
   * @param filter Điều kiện tìm kiếm (Tên nhân viên, Phòng ban)
   * @param currentSortConfig Cấu hình sắp xếp hiện tại
   * @param page Số trang cần lấy dữ liệu
   */
  const fetchEmployees = useCallback(async (
    filter: EmployeeSearchFilter,
    currentSortConfig: EmployeeSortConfig,
    page: number,
  ): Promise<void> => {
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

  // Tải danh sách phòng ban 1 lần khi khởi tạo
  useEffect(() => {
    void fetchDepartments();
  }, [fetchDepartments]);

  // Tải danh sách nhân viên khi filter, sort hoặc trang thay đổi
  useEffect(() => {
    if (isRestored) {
      void fetchEmployees(searchParams, sortConfig, currentPage);
    }
  }, [fetchEmployees, searchParams, sortConfig, currentPage, isRestored]);

  /**
   * Cập nhật điều kiện tìm kiếm mới và quay về trang 1.
   *
   * @param filter Điều kiện tìm kiếm từ form
   */
  const handleSearch = useCallback((filter: EmployeeSearchFilter): void => {
    setSearchParams(filter);
    setCurrentPage(1);
  }, []);

  /**
   * Thay đổi cột sắp xếp ưu tiên và quay về trang 1.
   *
   * @param field Cột được click chọn sắp xếp
   */
  const handleSort = useCallback((field: SortField): void => {
    setSortConfig((previousConfig) => createNextSortConfig(previousConfig, field));
    setCurrentPage(1);
  }, []);

  /**
   * Chuyển đến trang được chọn.
   *
   * @param page Số trang đích
   */
  const handlePageChange = useCallback((page: number): void => {
    setCurrentPage((currentPageValue) => (page === currentPageValue ? currentPageValue : page));
  }, []);

  const router = useRouter();

  /**
   * Chuyển hướng sang màn hình thêm mới nhân viên ADM004 (xóa form tạm cũ nếu có).
   */
  const handleNavigateToAdd = useCallback((): void => {
    clearEmployeeFormData();
    router.push(ADM004_ROUTES.input);
  }, [router]);

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
    handleNavigateToAdd,
  };
}
