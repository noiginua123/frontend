import { STORAGE_KEYS } from '@/constants/storage';
import { SORT_ORDER } from '@/constants/sort';
import {
  EmployeeSearchFilter,
  EmployeeSortConfig,
} from '@/types/employee';
import {
  employeeFormSchema,
  employeeEditSchema,
  type EmployeeFormData,
} from '@/lib/validation/validateEmployeeForm';
import { INITIAL_PRIORITY_SORT_FIELD } from './sort';

/* ==========================================================================
   1. QUẢN LÝ SESSION STATE MÀN HÌNH DANH SÁCH NHÂN VIÊN (ADM002)
   ========================================================================== */

/**
 * Trạng thái hiển thị và tìm kiếm của màn hình ADM002 được lưu vào sessionStorage.
 */
export interface ADM002SessionState {
  /** Trang hiện tại của danh sách phân trang (1-indexed, tối thiểu là 1) */
  currentPage: number;
  /** Tiêu chí tìm kiếm người dùng đang áp dụng (tên nhân viên, phòng ban) */
  searchParams: EmployeeSearchFilter;
  /** Cấu hình sắp xếp các cột ưu tiên và chiều sắp xếp (ASC/DESC) */
  sortConfig: EmployeeSortConfig;
}

/**
 * Đọc và khôi phục trạng thái làm việc của màn hình ADM002 từ sessionStorage.
 *
 * Quy trình xử lý:
 * 1. Kiểm tra môi trường thực thi (chỉ chạy trên trình duyệt Client-side, bỏ qua khi SSR).
 * 2. Đọc chuỗi JSON thô từ key `STORAGE_KEYS.ADM002_FILTER`.
 * 3. Parse JSON an toàn và kiểm tra kiểu dữ liệu cho từng thuộc tính:
 *    - `currentPage`: ép kiểu số nguyên dương (> 0), fallback về 1 nếu dữ liệu sai lệch.
 *    - `searchParams`: chuẩn hóa chuỗi `fullname` và `departmentId`.
 *    - `sortConfig`: chuẩn hóa cột ưu tiên và trạng thái chiều sắp xếp (ASC/DESC).
 *
 * @return Đối tượng `ADM002SessionState` hợp lệ đã được chuẩn hóa, hoặc `null` nếu không có dữ liệu / bị lỗi
 */
export function loadStoredADM002State(): ADM002SessionState | null {
  // Tránh lỗi thực thi khi render phía Server (Next.js SSR)
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

    // Khôi phục và chuẩn hóa dữ liệu phòng ngừa trường hợp lưu dữ liệu không hợp lệ
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
    // Trả về null khi chuỗi JSON bị lỗi cú pháp để ADM002 sử dụng state khởi tạo mặc định
    return null;
  }
}

/**
 * Lưu trạng thái tìm kiếm, phân trang và sắp xếp hiện tại của ADM002 vào sessionStorage.
 *
 * @param state Đối tượng trạng thái ADM002 cần lưu trữ
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
    // Bỏ qua lỗi hạn mức dung lượng sessionStorage (QuotaExceededError) hoặc khi trình duyệt tắt storage
  }
}

/* ==========================================================================
   2. QUẢN LÝ DỮ LIỆU FORM THÊM / SỬA NHÂN VIÊN (ADM004 - ADM005)
   ========================================================================== */

/**
 * Chế độ thao tác của Form nhập liệu nhân viên:
 * - 'add': Chức năng Thêm mới nhân viên.
 * - 'edit': Chức năng Chỉnh sửa thông tin nhân viên đã có trong cơ sở dữ liệu.
 */
export type FormMode = 'add' | 'edit';

/**
 * Cấu trúc dữ liệu form ADM004 được lưu tạm vào sessionStorage.
 * Kế thừa toàn bộ các trường nhập liệu từ `EmployeeFormData`, đồng thời mở rộng thêm
 * các thông tin bổ trợ phục vụ cho việc hiển thị tại màn hình xác nhận ADM005:
 */
export interface StoredEmployeeForm extends EmployeeFormData {
  /** ID nhân viên cần chỉnh sửa trong DB (chỉ tồn tại ở chế độ Edit) */
  employeeId?: number | string;
  /** Tên phòng ban tương ứng với departmentId để ADM005 hiển thị trực tiếp dạng nhãn */
  departmentName?: string;
  /** Tên chứng chỉ tiếng Nhật tương ứng với certificationId để ADM005 hiển thị nhãn */
  certificationName?: string;
  /** Chế độ thao tác: Thêm mới ('add') hoặc Chỉnh sửa ('edit') */
  mode?: FormMode;
}

/**
 * Lưu dữ liệu form nhập liệu ADM004 vào sessionStorage để chuyển tiếp sang ADM005.
 *
 * @param data Dữ liệu form nhập liệu hoàn chỉnh kèm ID và tên nhãn hiển thị danh mục
 */
export function saveEmployeeFormData(data: StoredEmployeeForm): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEYS.ADM004_FORM, JSON.stringify(data));
  } catch {
    // Phòng ngừa ngoại lệ khi trình duyệt chặn quyền lưu trữ hoặc quá hạn mức sessionStorage
  }
}

/**
 * Đọc và kiểm tra tính hợp lệ của dữ liệu form ADM004 đã lưu trong sessionStorage.
 *
 * Cơ chế hoạt động:
 * 1. Đọc chuỗi JSON lưu tại key `STORAGE_KEYS.ADM004_FORM`.
 * 2. Parse JSON thành đối tượng.
 * 3. Tự động nhận diện chế độ thao tác:
 *    - Nếu `mode === 'edit'` hoặc có `employeeId`: Áp dụng `employeeEditSchema`
 *      (cho phép mật khẩu rỗng và không bắt buộc validate tài khoản đăng nhập).
 *    - Ngược lại: Áp dụng `employeeFormSchema` (chế độ Thêm mới, bắt buộc mật khẩu và tài khoản).
 * 4. Xác thực dữ liệu qua `schemaToUse.safeParse(storedValue)`. Nếu dữ liệu không hợp lệ
 *    (ví dụ: bị chỉnh sửa trái phép hoặc thiếu trường bắt buộc), hủy bỏ và trả về `null`.
 * 5. Bổ sung các trường nhãn hiển thị (`employeeId`, `mode`, `departmentName`, `certificationName`)
 *    và trả về đối tượng `StoredEmployeeForm`.
 *
 * @return Dữ liệu form đã xác thực hợp lệ hoặc `null` nếu không tồn tại / không vượt qua schema
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
    if (!storedValue || typeof storedValue !== 'object') {
      return null;
    }

    const rawObj = storedValue as Record<string, unknown>;

    // 1. Xác định chế độ dựa vào thuộc tính mode hoặc sự hiện diện của employeeId
    const isEditMode = rawObj.mode === 'edit' || Boolean(rawObj.employeeId);

    // 2. Chọn Schema Zod tương ứng để parse dữ liệu form
    const schemaToUse = isEditMode ? employeeEditSchema : employeeFormSchema;
    const parsedForm = schemaToUse.safeParse(storedValue);
    if (!parsedForm.success) {
      // Dữ liệu trong sessionStorage không khớp với schema yêu cầu -> Loại bỏ để tránh lỗi form
      return null;
    }

    // 3. Đóng gói lại kèm các trường metadata nhãn hiển thị
    const storedLabels = storedValue as Record<string, unknown>;
    return {
      ...parsedForm.data,
      employeeId:
        typeof storedLabels.employeeId === 'number' || typeof storedLabels.employeeId === 'string'
          ? storedLabels.employeeId
          : undefined,
      mode: storedLabels.mode === 'edit' ? 'edit' : 'add',
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
    // Trả về null khi có lỗi parse JSON hoặc lỗi bộ nhớ
    return null;
  }
}

/**
 * Xóa sạch dữ liệu form ADM004 khỏi sessionStorage.
 *
 * Thường được kích hoạt trong các trường hợp:
 * - Người dùng bấm Đăng ký/Xác nhận thành công tại ADM005 và chuyển sang màn hình hoàn tất ADM006.
 * - Người dùng bấm Huỷ bỏ (Cancel) tại ADM004 để quay về danh sách (ADM002) hoặc chi tiết (ADM003).
 * - Mở mới chức năng Thêm mới nhân viên từ ADM002 để xóa bỏ trạng thái nhập dở dang cũ.
 */
export function clearEmployeeFormData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.removeItem(STORAGE_KEYS.ADM004_FORM);
  } catch {
    // Bỏ qua lỗi truy cập sessionStorage
  }
}
