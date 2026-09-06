import { z } from 'zod';
import {
  ADM002_MESSAGES,
  EMPLOYEE_NAME_MAX_LENGTH,
} from '@/constants/adm002';
import { ERR_CODE, FIELD_LABELS, getErrorMessage } from '@/constants/messages';
import { codePointLength } from '@/utils/validation';

/**
 * Chuẩn hóa input tên nhân viên trước khi lưu vào state hoặc gửi tìm kiếm (ADM002)
 */
export function sanitizeEmployeeNameInput(value: string): string {
  return value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
}

/**
 * Schema kiểm tra dữ liệu tìm kiếm nhân viên (ADM002).
 * - fullname: Cho phép để trống để tìm tất cả.
 * - Nếu có nhập nhưng chỉ toàn khoảng trắng -> báo lỗi ER001 (Yêu cầu nhập họ tên).
 * - Tối đa 125 ký tự -> báo lỗi ER006 (Giới hạn độ dài).
 */
export const employeeSearchSchema = z.object({
  fullname: z.string().superRefine((val, ctx) => {
    // Bắt lỗi khi người dùng gõ toàn dấu cách
    if (val.length > 0 && val.trim().length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.FULLNAME]),
      });
      return;
    }

    // Kiểm tra độ dài tối đa 125 ký tự
    if (codePointLength(val.trim()) > EMPLOYEE_NAME_MAX_LENGTH) {
      ctx.addIssue({
        code: 'custom',
        message: ADM002_MESSAGES.fullnameMaxLength,
      });
    }
  }),
  departmentId: z.string(),
});

export type EmployeeSearchFormData = z.infer<typeof employeeSearchSchema>;
