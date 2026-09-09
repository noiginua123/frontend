/**
 * Quản lý tập trung toàn bộ key dùng trong sessionStorage, localStorage và cookies.
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  TOKEN_TYPE: 'token_type',
  ADM002_FILTER: 'adm002_filter_state',
  ADM004_FORM: 'adm004_employee_form',
  ADM004_ERROR: 'adm004_error_message',
  ADM006_SUCCESS_MESSAGE: 'adm006_success_message',
} as const;

/** Khóa lưu trạng thái tìm kiếm/phân trang ADM002 (tương thích ngược). */
export const ADM002_SESSION_KEY = STORAGE_KEYS.ADM002_FILTER;

/** Khóa lưu dữ liệu form ADM004 (tương thích ngược). */
export const ADM004_SESSION_KEY = STORAGE_KEYS.ADM004_FORM;

/** Khóa lưu thông báo lỗi khi bị điều hướng từ ADM005 về ADM004 (tương thích ngược). */
export const ADM004_ERROR_KEY = STORAGE_KEYS.ADM004_ERROR;

/** Khóa lưu message thành công để hiển thị ở ADM006 (tương thích ngược). */
export const ADM006_MESSAGE_KEY = STORAGE_KEYS.ADM006_SUCCESS_MESSAGE;
