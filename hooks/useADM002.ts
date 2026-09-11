'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// --- Danh sách Import (Hằng số, API, Kiểu dữ liệu, Tiện ích) ---
import {
  ADM002_MESSAGES,
  ADM002_PAGE_SIZE,
} from '@/constants/employee';
import { ROUTES } from '@/constants/routes';
import { SORT_ORDER, SortOrder } from '@/constants/sort';
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
  EmployeeSearchFormData,
  employeeSearchSchema,
} from '@/lib/validation/employee';
import {
  createNextSortConfig,
  INITIAL_SORT_CONFIG,
  INITIAL_SORT_STATE,
} from '@/utils/sort';
import {
  ADM002SessionState,
  loadStoredADM002State,
  saveStoredADM002State,
  clearEmployeeFormData,
} from '@/utils/storage';
import { buildEmployeeQueryParams } from '@/utils/query';
import { createVisiblePages } from '@/utils/pagination';

export { INITIAL_SORT_STATE };
export type { ADM002SessionState };

/**
 * Điều kiện lọc tìm kiếm mặc định ban đầu.
 */
const INITIAL_SEARCH_FILTER: EmployeeSearchFilter = {
  fullname: '',
  departmentId: '',
};

/**
 * Hook quản lý toàn bộ luồng nghiệp vụ của màn hình danh sách nhân viên (ADM002).
 * Xử lý: Nạp dữ liệu phòng ban, tìm kiếm, phân trang, sắp xếp đa cột và khôi phục trạng thái từ bộ nhớ phiên.
 *
 * @return Các trạng thái, phương thức biểu mẫu và hàm xử lý sự kiện cho màn hình ADM002
 */
export function useADM002() {
  /** Hook điều hướng trang */
  const router = useRouter();

  /** Hook đọc query string từ URL hiện tại */
  const nextSearchParams = useSearchParams();
  const queryString = nextSearchParams ? nextSearchParams.toString() : '';

  // --- 1. Trạng thái và Cấu hình ---

  /** Danh sách phòng ban (Dữ liệu danh mục cho dropdown tìm kiếm) */
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);

  /** Danh sách nhân viên hiển thị trên bảng dữ liệu */
  const [employees, setEmployees] = useState<EmployeeListDTO[]>([]);

  /** Tổng số lượng bản ghi thỏa mãn điều kiện tìm kiếm */
  const [totalRecords, setTotalRecords] = useState<number>(0);

  /** Trạng thái đang tải dữ liệu danh sách nhân viên */
  const [loading, setLoading] = useState<boolean>(true);

  /** Thông báo lỗi khi tải danh mục phòng ban thất bại */
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  /** Thông báo lỗi khi tải danh sách nhân viên thất bại */
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  /** Trang hiện tại của danh sách nhân viên */
  const [currentPage, setCurrentPage] = useState<number>(1);

  /** Điều kiện tìm kiếm hiện tại (Tên nhân viên, ID phòng ban) */
  const [searchParams, setSearchParams] = useState<EmployeeSearchFilter>(INITIAL_SEARCH_FILTER);

  /** Cấu hình sắp xếp hiện tại (Cột ưu tiên và trạng thái chiều sắp xếp từng cột) */
  const [sortConfig, setSortConfig] = useState<EmployeeSortConfig>(INITIAL_SORT_CONFIG);

  /** Cờ xác định đã hoàn tất khôi phục trạng thái từ bộ nhớ phiên hay chưa */
  const [isRestored, setIsRestored] = useState<boolean>(false);

  // Khởi tạo React Hook Form cho biểu mẫu tìm kiếm
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<EmployeeSearchFormData>({
    resolver: zodResolver(employeeSearchSchema),
    defaultValues: {
      fullname: searchParams.fullname,
      departmentId: searchParams.departmentId,
    },
  });

  // --- 2. Vòng đời và Khởi tạo dữ liệu ---

  /**
   * Gọi API lấy danh sách phòng ban cho hộp chọn tìm kiếm.
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
   * Gọi API lấy danh sách nhân viên theo điều kiện lọc, cấu hình sắp xếp và số trang.
   *
   * @param filter Điều kiện tìm kiếm hiện tại
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

  // Khôi phục trạng thái bộ lọc và phân trang từ sessionStorage sau khi gắn vào giao diện
  useEffect(() => {
    const stored = loadStoredADM002State();
    if (stored) {
      setCurrentPage(stored.currentPage);
      setSearchParams(stored.searchParams);
      setSortConfig(stored.sortConfig);
    }
    setIsRestored(true);
  }, []);

  // Tự động đồng bộ trạng thái tìm kiếm và phân trang vào sessionStorage khi có thay đổi
  useEffect(() => {
    if (isRestored) {
      saveStoredADM002State({
        currentPage,
        searchParams,
        sortConfig,
      });
    }
  }, [currentPage, searchParams, sortConfig, isRestored]);

  // Tải danh sách phòng ban khi thành phần được gắn vào giao diện
  useEffect(() => {
    void fetchDepartments();
  }, [fetchDepartments]);

  // Tải danh sách nhân viên khi điều kiện lọc, sắp xếp hoặc số trang thay đổi
  useEffect(() => {
    if (isRestored) {
      void fetchEmployees(searchParams, sortConfig, currentPage);
    }
  }, [fetchEmployees, searchParams, sortConfig, currentPage, isRestored]);

  // Tự động đưa con trỏ chuột vào ô nhập tên nhân viên khi vào màn hình
  useEffect(() => {
    setFocus('fullname');
  }, [setFocus]);

  // Đồng bộ lại biểu mẫu tìm kiếm khi dữ liệu được khôi phục từ bộ nhớ phiên
  useEffect(() => {
    reset({
      fullname: searchParams.fullname,
      departmentId: searchParams.departmentId,
    });
  }, [searchParams.fullname, searchParams.departmentId, reset]);

  // --- 3. Các hàm xử lý sự kiện ---

  /**
   * Cập nhật điều kiện tìm kiếm mới và đưa danh sách về trang 1.
   *
   * @param filter Điều kiện tìm kiếm từ biểu mẫu
   */
  const handleSearch = useCallback((filter: EmployeeSearchFilter): void => {
    setSearchParams(filter);
    setCurrentPage(1);
  }, []);

  /**
   * Xử lý xác nhận tìm kiếm từ biểu mẫu.
   */
  const onSearchSubmit = handleSubmit((formData: EmployeeSearchFormData): void => {
    handleSearch(formData);
  });

  /**
   * Thay đổi cột sắp xếp ưu tiên và đưa danh sách về trang 1.
   *
   * @param field Cột được nhấn chọn sắp xếp
   */
  const handleSort = useCallback((field: SortField): void => {
    setSortConfig((previousConfig) => createNextSortConfig(previousConfig, field));
    setCurrentPage(1);
  }, []);

  /**
   * Chuyển đến trang được chọn trên thanh phân trang.
   *
   * @param page Số trang đích
   */
  const handlePageChange = useCallback((page: number): void => {
    setCurrentPage((currentPageValue) => (page === currentPageValue ? currentPageValue : page));
  }, []);

  /**
   * Chuyển hướng sang màn hình thêm mới nhân viên ADM004 (dọn sạch dữ liệu phiên cũ nếu có).
   */
  const handleNavigateToAdd = useCallback((): void => {
    clearEmployeeFormData();
    router.push(ROUTES.EMPLOYEES.INPUT);
  }, [router]);

  /**
   * Chuyển hướng sang màn hình xem chi tiết nhân viên ADM003 theo ID.
   *
   * @param employeeId ID của nhân viên cần xem chi tiết
   */
  const handleViewDetail = useCallback((employeeId: number | string): void => {
    router.push(ROUTES.EMPLOYEES.DETAIL(employeeId));
  }, [router]);

  // --- 4. Các hàm hỗ trợ nội bộ ---

  /**
   * Tạo đường dẫn đến màn hình xem chi tiết nhân viên ADM003 kèm query string hiện tại.
   *
   * @param id ID nhân viên
   * @return Đường dẫn xem chi tiết đầy đủ
   */
  const getHref = useCallback((id: number): string => {
    const base = ROUTES.EMPLOYEES.DETAIL(id);
    return queryString ? `${base}&${queryString}` : base;
  }, [queryString]);

  /**
   * Hiển thị nhãn cột kèm biểu tượng chiều sắp xếp (▲▽ / ▼△).
   *
   * @param label Tên nhãn hiển thị của cột
   * @param sortOrder Chiều sắp xếp (ASC / DESC)
   * @return Chuỗi nhãn kèm biểu tượng sắp xếp
   */
  const renderSortLabel = useCallback((label: string, sortOrder: SortOrder): string => {
    const icon = sortOrder === SORT_ORDER.ASC ? '▲▽' : '▼△';
    return `${label} ${icon}`;
  }, []);

  // Tính toán tổng số trang và danh sách các trang hiển thị
  const totalPages = Math.ceil(totalRecords / ADM002_PAGE_SIZE);
  const visiblePages = createVisiblePages(currentPage, totalPages);

  return {
    // Dữ liệu danh mục & Trạng thái lỗi
    departments,
    departmentError,
    employeeError,
    loading,

    // Dữ liệu danh sách & Trạng thái phân trang
    employees,
    totalRecords,
    totalPages,
    visiblePages,
    currentPage,

    // Trạng thái tìm kiếm & Sắp xếp
    searchParams,
    sortState: sortConfig.sortState,
    prioritySortField: sortConfig.prioritySortField,

    // Biểu mẫu tìm kiếm & Phương thức xác thực
    register,
    errors,
    onSearchSubmit,

    // Các hàm xử lý sự kiện & Điều hướng
    getHref,
    renderSortLabel,
    handleSearch,
    handleSort,
    handlePageChange,
    handleNavigateToAdd,
    handleViewDetail,
  };
}
