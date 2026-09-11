// =============================================================================
// HẰNG SỐ GIỚI HẠN & BIỂU THỨC CHÍNH QUY (REGEX)
// =============================================================================
export const MAX_LENGTH_50 = 50;
export const MAX_LENGTH_125 = 125;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 50;
export const EMAIL_FORMAT_TOKEN = 'メールア';

/** Katakana nửa góc (Half-width Katakana) theo test case và specs dự án */
export const KATAKANA_HALF_WIDTH_REGEX = /^[\uFF65-\uFF9F ]+$/;
/** Ký tự nửa góc 1-byte */
export const HALF_SIZE_REGEX = /^[\u0020-\u007E]+$/;
/** Tên tài khoản: chữ cái, số, gạch dưới; chữ cái đầu không phải số */
export const LOGIN_ID_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
/** Chữ số nguyên dương */
export const DIGITS_REGEX = /^[0-9]+$/;
/** Định dạng ngày YYYY/MM/DD */
export const DATE_FORMAT_REGEX = /^\d{4}\/\d{2}\/\d{2}$/;

// =============================================================================
// CÁC HÀM TIỆN ÍCH KIỂM TRA (HELPERS)
// =============================================================================

/**
 * Đếm ký tự Unicode (Code Points) chuẩn xác (ví dụ Emoji hoặc ký tự đặc biệt)
 */
export function codePointLength(value: string): number {
  return Array.from(value).length;
}

/**
 * Kiểm tra chuỗi rỗng sau khi cắt khoảng trắng 2 đầu
 */
export function isEmpty(value: string | undefined | null): boolean {
  return !value || value.trim() === '';
}

/**
 * Kiểm tra định dạng ngày lịch hợp lệ (tránh các ngày không tồn tại như 2024/02/30)
 */
export function isValidDate(dateStr: string): boolean {
  const trimmed = dateStr.trim();
  if (!DATE_FORMAT_REGEX.test(trimmed)) {
    return false;
  }
  const [year, month, day] = trimmed.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Chuyển ngày YYYY/MM/DD sang timestamp để so sánh trước/sau
 */
export function toTimestamp(dateStr: string): number {
  const [year, month, day] = dateStr.trim().split('/').map(Number);
  return new Date(year, month - 1, day).getTime();
}

/**
 * Kiểm tra định dạng email cơ bản
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return (
    trimmed.includes('@') &&
    trimmed.includes('.') &&
    !trimmed.startsWith('@') &&
    !trimmed.startsWith('.') &&
    !trimmed.includes('@.') &&
    !trimmed.includes('.@') &&
    !/\s/.test(trimmed)
  );
}

/**
 * Kiểm tra số nguyên dương (> 0)
 */
export function isPositiveNumber(value: string): boolean {
  const trimmed = value.trim();
  return DIGITS_REGEX.test(trimmed) && Number(trimmed) > 0;
}
