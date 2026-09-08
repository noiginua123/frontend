import { ADM002_SESSION_KEY } from '@/constants/adm002';
import { SORT_ORDER } from '@/constants/sort';
import {
  EmployeeSearchFilter,
  EmployeeSortConfig,
} from '@/types/employee';
import { INITIAL_PRIORITY_SORT_FIELD } from './sort';

/**
 * Trạng thái bộ lọc và phân trang ADM002 được lưu vào sessionStorage.
 */
export interface ADM002SessionState {
  currentPage: number;
  searchParams: EmployeeSearchFilter;
  sortConfig: EmployeeSortConfig;
}

/**
 * Đọc và khôi phục trạng thái làm việc của màn hình ADM002 từ sessionStorage.
 * Tự động validate kiểu dữ liệu và fallback về giá trị mặc định nếu dữ liệu lưu bị hỏng.
 *
 * @return Trạng thái ADM002 hợp lệ hoặc null nếu không tồn tại
 */
export function loadStoredADM002State(): ADM002SessionState | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(ADM002_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ADM002SessionState>;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return {
      currentPage: 1, // Luôn quay về trang 1 khi tải lại màn hình danh sách, giữ nguyên searchParams và sortConfig
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
  } catch {
    return null;
  }
}

/**
 * Lưu trạng thái tìm kiếm, phân trang và sắp xếp hiện tại của ADM002 vào sessionStorage.
 *
 * @param state Trạng thái màn hình ADM002 cần lưu
 */
export function saveStoredADM002State(state: ADM002SessionState): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(
      ADM002_SESSION_KEY,
      JSON.stringify(state),
    );
  } catch {
    // Bỏ qua lỗi hạn mức sessionStorage
  }
}
