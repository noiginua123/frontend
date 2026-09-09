import { STORAGE_KEYS } from '@/constants/storage';
import { SORT_ORDER } from '@/constants/sort';
import {
  EmployeeSearchFilter,
  EmployeeSortConfig,
} from '@/types/employee';
import {
  employeeFormSchema,
  type EmployeeFormData,
} from '@/lib/validation/validateEmployeeForm';
import { INITIAL_PRIORITY_SORT_FIELD } from './sort';

/* ==========================================================================
   1. QUẢN LÝ SESSION STATE MÀN HÌNH DANH SÁCH NHÂN VIÊN (ADM002)
   ========================================================================== */

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
    const raw = window.sessionStorage.getItem(STORAGE_KEYS.ADM002_FILTER);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ADM002SessionState>;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return {
      currentPage:
        typeof parsed.currentPage === 'number' && parsed.currentPage > 0
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
      STORAGE_KEYS.ADM002_FILTER,
      JSON.stringify(state),
    );
  } catch {
    // Bỏ qua lỗi hạn mức sessionStorage
  }
}

/* ==========================================================================
   2. QUẢN LÝ DỮ LIỆU FORM THÊM / SỬA NHÂN VIÊN (ADM004 - ADM005)
   ========================================================================== */

/**
 * Dữ liệu form ADM004 được lưu tạm, kèm nhãn hiển thị (tên nhóm, tên chứng chỉ)
 * để màn hình xác nhận ADM005 hiển thị mà không cần gọi lại API master.
 */
export interface StoredEmployeeForm extends EmployeeFormData {
  departmentName?: string;
  certificationName?: string;
}

/**
 * Lưu dữ liệu form ADM004 vào sessionStorage.
 *
 * @param data Dữ liệu form kèm nhãn hiển thị
 */
export function saveEmployeeFormData(data: StoredEmployeeForm): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEYS.ADM004_FORM, JSON.stringify(data));
  } catch {
    // Bỏ qua lỗi hạn mức sessionStorage
  }
}

/**
 * Đọc dữ liệu form ADM004 đã lưu từ sessionStorage.
 *
 * @return Dữ liệu form hoặc null nếu không tồn tại / lỗi
 */
export function loadEmployeeFormData(): StoredEmployeeForm | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const rawValue = window.sessionStorage.getItem(STORAGE_KEYS.ADM004_FORM);
    if (!rawValue) {
      return null;
    }

    const storedValue: unknown = JSON.parse(rawValue);
    const parsedForm = employeeFormSchema.safeParse(storedValue);
    if (!parsedForm.success) {
      return null;
    }

    const storedLabels = storedValue as Record<string, unknown>;
    return {
      ...parsedForm.data,
      departmentName:
        typeof storedLabels.departmentName === 'string'
          ? storedLabels.departmentName
          : undefined,
      certificationName:
        typeof storedLabels.certificationName === 'string'
          ? storedLabels.certificationName
          : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Xóa dữ liệu form ADM004 khỏi sessionStorage (sau khi đăng ký thành công hoặc khi reset).
 */
export function clearEmployeeFormData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.removeItem(STORAGE_KEYS.ADM004_FORM);
  } catch {
    // Bỏ qua lỗi sessionStorage
  }
}
