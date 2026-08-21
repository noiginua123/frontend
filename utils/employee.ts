import { EMPLOYEE_NAME_DISPLAY_LENGTH } from '@/constants/adm002';

/**
 * Rút gọn tên nhân viên từ 22 ký tự và giữ nguyên tên đầy đủ ở dữ liệu gốc.
 * Array.from được dùng để đếm đúng ký tự Unicode thay vì UTF-16 code unit.
 *
 * @param employeeName Tên nhân viên cần rút gọn
 * @return Tên nhân viên đã được định dạng để hiển thị
 */
export function truncateEmployeeName(employeeName: string): string {
  const characters = Array.from(employeeName);
  if (characters.length < EMPLOYEE_NAME_DISPLAY_LENGTH) {
    return employeeName;
  }

  return `${characters.slice(0, EMPLOYEE_NAME_DISPLAY_LENGTH).join('')}...`;
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
