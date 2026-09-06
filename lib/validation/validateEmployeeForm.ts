import { z } from 'zod';
import { ERR_CODE, FIELD_LABELS, getErrorMessage } from '@/constants/messages';

import {
  MAX_LENGTH_50,
  MAX_LENGTH_125,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  EMAIL_FORMAT_TOKEN,
  KATAKANA_HALF_WIDTH_REGEX,
  HALF_SIZE_REGEX,
  LOGIN_ID_REGEX,
  codePointLength,
  isEmpty,
  isValidDate,
  isValidEmail,
  isPositiveNumber,
  toTimestamp,
} from '@/utils/validation';


export const employeeFormSchema = z
  .object({
    // -------------------------------------------------------------------------
    // 1.1 Tên tài khoản (employeeLoginId)
    // - Bắt buộc nhập (ER001)
    // - Tối đa 50 ký tự (ER006)
    // - Không bắt đầu bằng số, chỉ gồm a-z, A-Z, 0-9, _ (ER019)
    // -------------------------------------------------------------------------
    employeeLoginId: z.string().superRefine((val, ctx) => {
      const trimmed = val.trim();
      if (trimmed === '') {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.LOGIN_ID]),
        });
        return;
      }
      if (codePointLength(trimmed) > MAX_LENGTH_50) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER006, [MAX_LENGTH_50, FIELD_LABELS.LOGIN_ID]),
        });
        return;
      }
      if (!LOGIN_ID_REGEX.test(trimmed)) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER019),
        });
      }
    }),

    // -------------------------------------------------------------------------
    // 1.2 Phòng ban (departmentId)
    // - Bắt buộc chọn (ER002)
    // -------------------------------------------------------------------------
    departmentId: z.string().superRefine((val, ctx) => {
      if (isEmpty(val)) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER002, [FIELD_LABELS.GROUP]),
        });
      }
    }),

    // -------------------------------------------------------------------------
    // 1.3 Họ và tên (employeeName)
    // - Bắt buộc nhập (ER001)
    // - Tối đa 125 ký tự (ER006)
    // -------------------------------------------------------------------------
    employeeName: z.string().superRefine((val, ctx) => {
      const trimmed = val.trim();
      if (trimmed === '') {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.FULLNAME]),
        });
        return;
      }
      if (codePointLength(trimmed) > MAX_LENGTH_125) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER006, [MAX_LENGTH_125, FIELD_LABELS.FULLNAME]),
        });
      }
    }),

    // -------------------------------------------------------------------------
    // 1.4 Họ tên Katakana (employeeNameKana)
    // - Bắt buộc nhập (ER001)
    // - Tối đa 125 ký tự (ER006)
    // - Định dạng Katakana (ER009)
    // -------------------------------------------------------------------------
    employeeNameKana: z.string().superRefine((val, ctx) => {
      const trimmed = val.trim();
      if (trimmed === '') {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.FULLNAME_KANA]),
        });
        return;
      }
      if (codePointLength(trimmed) > MAX_LENGTH_125) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER006, [MAX_LENGTH_125, FIELD_LABELS.FULLNAME_KANA]),
        });
        return;
      }
      if (!KATAKANA_HALF_WIDTH_REGEX.test(trimmed)) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER009, [FIELD_LABELS.FULLNAME_KANA]),
        });
      }
    }),

    // -------------------------------------------------------------------------
    // 1.5 Ngày sinh (employeeBirthDate)
    // - Bắt buộc chọn / nhập (ER002)
    // - Ngày tháng hợp lệ theo lịch (ER011)
    // -------------------------------------------------------------------------
    employeeBirthDate: z.string().superRefine((val, ctx) => {
      const trimmed = val.trim();
      if (trimmed === '') {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER002, [FIELD_LABELS.BIRTH_DATE]),
        });
        return;
      }
      if (!isValidDate(trimmed)) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER011, [FIELD_LABELS.BIRTH_DATE]),
        });
      }
    }),

    // -------------------------------------------------------------------------
    // 1.6 Email (employeeEmail)
    // - Bắt buộc nhập (ER001)
    // - Tối đa 125 ký tự (ER006)
    // - Định dạng Email hợp lệ (ER005)
    // -------------------------------------------------------------------------
    employeeEmail: z.string().superRefine((val, ctx) => {
      const trimmed = val.trim();
      if (trimmed === '') {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.EMAIL]),
        });
        return;
      }
      if (codePointLength(trimmed) > MAX_LENGTH_125) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER006, [MAX_LENGTH_125, FIELD_LABELS.EMAIL]),
        });
        return;
      }
      if (!isValidEmail(trimmed)) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER005, [FIELD_LABELS.EMAIL, EMAIL_FORMAT_TOKEN]),
        });
      }
    }),

    // -------------------------------------------------------------------------
    // 1.7 Số điện thoại (employeeTelephone)
    // - Bắt buộc nhập (ER001)
    // - Tối đa 50 ký tự (ER006)
    // - Chỉ gồm ký tự nửa góc 1-byte (ER008)
    // -------------------------------------------------------------------------
    employeeTelephone: z.string().superRefine((val, ctx) => {
      const trimmed = val.trim();
      if (trimmed === '') {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.TEL]),
        });
        return;
      }
      if (codePointLength(trimmed) > MAX_LENGTH_50) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER006, [MAX_LENGTH_50, FIELD_LABELS.TEL]),
        });
        return;
      }
      if (!HALF_SIZE_REGEX.test(trimmed)) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER008, [FIELD_LABELS.TEL]),
        });
      }
    }),

    // -------------------------------------------------------------------------
    // 1.8 Mật khẩu (employeeLoginPassword)
    // - Bắt buộc nhập (ER001)
    // - Độ dài từ 8 đến 50 ký tự (ER007)
    // -------------------------------------------------------------------------
    employeeLoginPassword: z.string().superRefine((val, ctx) => {
      // 1.8.1 Bắt buộc nhập (ER001)
      if (isEmpty(val)) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.PASSWORD]),
        });
        return;
      }
      // 1.8.2 Độ dài ngoài khoảng 8 đến 50 ký tự (ER007)
      const len = codePointLength(val);
      if (len < PASSWORD_MIN_LENGTH || len > PASSWORD_MAX_LENGTH) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER007, [
            FIELD_LABELS.PASSWORD,
            PASSWORD_MIN_LENGTH,
            PASSWORD_MAX_LENGTH,
          ]),
        });
      }
    }),

    // -------------------------------------------------------------------------
    // 1.9 Xác nhận mật khẩu (employeeLoginPasswordConfirm)
    // - Bắt buộc nhập khi có nhập mật khẩu (ER001)
    // -------------------------------------------------------------------------
    employeeLoginPasswordConfirm: z.string().superRefine((val, ctx) => {
      if (isEmpty(val)) {
        ctx.addIssue({
          code: 'custom',
          message: getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.PASSWORD_CONFIRM]),
        });
      }
    }),

    // -------------------------------------------------------------------------
    // 1.10 Các trường Bằng cấp tiếng Nhật (Tùy chọn ở cấp field)
    // -------------------------------------------------------------------------
    certificationId: z.string(),
    certificationStartDate: z.string(),
    certificationEndDate: z.string(),
    certificationScore: z.string(),
  })
  .superRefine((data, ctx) => {
    // =========================================================================
    // 2.1 Kiểm tra khớp mật khẩu (ER017)
    // Chỉ kiểm tra khi đã nhập cả 2 mật khẩu
    // =========================================================================
    if (
      !isEmpty(data.employeeLoginPasswordConfirm) &&
      data.employeeLoginPasswordConfirm !== data.employeeLoginPassword
    ) {
      ctx.addIssue({
        code: 'custom',
        message: getErrorMessage(ERR_CODE.ER017),
        path: ['employeeLoginPasswordConfirm'],
      });
    }

    // =========================================================================
    // 2.2 Kiểm tra Bằng cấp (Chỉ kiểm tra khi người dùng CÓ chọn bằng cấp)
    // =========================================================================
    if (isEmpty(data.certificationId)) {
      return; // Không chọn bằng cấp -> Bỏ qua toàn bộ các trường bên dưới
    }

    // 2.2.1 Ngày cấp (certificationStartDate)
    let isStartDateValid = false;
    if (isEmpty(data.certificationStartDate)) {
      ctx.addIssue({
        code: 'custom',
        message: getErrorMessage(ERR_CODE.ER002, [FIELD_LABELS.START_DATE]),
        path: ['certificationStartDate'],
      });
    } else if (!isValidDate(data.certificationStartDate)) {
      ctx.addIssue({
        code: 'custom',
        message: getErrorMessage(ERR_CODE.ER011, [FIELD_LABELS.START_DATE]),
        path: ['certificationStartDate'],
      });
    } else {
      isStartDateValid = true;
    }

    // 2.2.2 Ngày hết hạn (certificationEndDate)
    let isEndDateValid = false;
    if (isEmpty(data.certificationEndDate)) {
      ctx.addIssue({
        code: 'custom',
        message: getErrorMessage(ERR_CODE.ER002, [FIELD_LABELS.END_DATE]),
        path: ['certificationEndDate'],
      });
    } else if (!isValidDate(data.certificationEndDate)) {
      ctx.addIssue({
        code: 'custom',
        message: getErrorMessage(ERR_CODE.ER011, [FIELD_LABELS.END_DATE]),
        path: ['certificationEndDate'],
      });
    } else {
      isEndDateValid = true;
    }

    // 2.2.3 So sánh Ngày hết hạn >= Ngày cấp (ER012)
    if (
      isStartDateValid &&
      isEndDateValid &&
      toTimestamp(data.certificationEndDate) < toTimestamp(data.certificationStartDate)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: getErrorMessage(ERR_CODE.ER012),
        path: ['certificationEndDate'],
      });
    }

    // 2.2.4 Điểm số (certificationScore)
    // - Bắt buộc nhập (ER001)
    // - Là số nguyên dương (ER018)
    if (isEmpty(data.certificationScore)) {
      ctx.addIssue({
        code: 'custom',
        message: getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.SCORE]),
        path: ['certificationScore'],
      });
    } else if (!isPositiveNumber(data.certificationScore)) {
      ctx.addIssue({
        code: 'custom',
        message: getErrorMessage(ERR_CODE.ER018, [FIELD_LABELS.SCORE]),
        path: ['certificationScore'],
      });
    }
  });

/**
 * Type inference cho dữ liệu form nhân viên
 */
export type EmployeeFormData = z.infer<typeof employeeFormSchema>;


