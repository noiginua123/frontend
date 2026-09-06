import { ADM004_SESSION_KEY } from '@/constants/adm004';
import {
  employeeFormSchema,
  type EmployeeFormData,
} from '@/lib/validation/validateEmployeeForm';

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
    window.sessionStorage.setItem(ADM004_SESSION_KEY, JSON.stringify(data));
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
    const rawValue = window.sessionStorage.getItem(ADM004_SESSION_KEY);
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
 * Xóa dữ liệu form ADM004 khỏi sessionStorage (sau khi đăng ký thành công).
 */
export function clearEmployeeFormData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.removeItem(ADM004_SESSION_KEY);
  } catch {
    // Bỏ qua lỗi sessionStorage
  }
}
