import { EMPLOYEE_NAME_DISPLAY_LENGTH } from '@/constants/employee';

/**
 * Rút gọn chuỗi văn bản (tên nhân viên, chứng chỉ...) khi vượt quá 20 ký tự và thêm dấu '...'.
 * Array.from được dùng để đếm đúng ký tự Unicode thay vì UTF-16 code unit.
 *
 * @param text Chuỗi văn bản cần rút gọn
 * @param maxLength Độ dài tối đa trước khi rút gọn (mặc định là EMPLOYEE_NAME_DISPLAY_LENGTH = 20)
 * @return Chuỗi văn bản đã được định dạng để hiển thị
 */
export function truncateEmployeeName(text?: string | null, maxLength: number = EMPLOYEE_NAME_DISPLAY_LENGTH): string {
  if (!text) {
    return '';
  }
  const characters = Array.from(text);
  if (characters.length <= maxLength) {
    return text;
  }

  return `${characters.slice(0, maxLength).join('')}...`;
}

/**
 * Chuẩn hóa ngày API thành định dạng yyyy/MM/dd để hiển thị.
 *
 * @param date Ngày cần định dạng
 * @return Ngày định dạng yyyy/MM/dd hoặc chuỗi rỗng
 */
export function formatEmployeeDate(date?: string): string {
  return date ? date.replace(/-/g, '/') : '';
}
