import { z } from 'zod';
import {
  ERR_CODE,
  FIELD_LABELS,
  MessageCode,
  formatValidationMessage,
  getErrorMessage,
} from '@/constants/messages';

import {
  MAX_LENGTH_50,
  MAX_LENGTH_125,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  EMAIL_FORMAT_TOKEN,
  KATAKANA_HALF_WIDTH_REGEX,
  HALF_SIZE_REGEX,
  codePointLength,
  isEmpty,
  isValidDate,
  isValidEmail,
  isPositiveNumber,
  toTimestamp,
} from '@/utils/validation';

/**
 * ---------------------------------------------------------------------------
 * CÁC TRƯỜNG DÙNG CHUNG (REUSABLE) GIỮA THÊM MỚI (ADD) VÀ CHỈNH SỬA (EDIT)
 * ---------------------------------------------------------------------------
 */
const commonEmployeeFields = {
  // 1. Phòng ban (departmentId) - Bắt buộc chọn (ER002)
  departmentId: z
    .string()
    .trim()
    .min(1, formatValidationMessage(MessageCode.ER002, FIELD_LABELS.GROUP)),

  // 2. Họ và tên (employeeName) - Bắt buộc nhập (ER001), tối đa 125 ký tự (ER006)
  employeeName: z
    .string()
    .trim()
    .min(1, formatValidationMessage(MessageCode.ER001, FIELD_LABELS.FULLNAME))
    .refine((val) => codePointLength(val) <= MAX_LENGTH_125, {
      message: formatValidationMessage(MessageCode.ER006, FIELD_LABELS.FULLNAME, '125'),
    }),

  // 3. Họ tên Katakana (employeeNameKana) - Bắt buộc (ER001), tối đa 125 (ER006), Katakana (ER009)
  employeeNameKana: z
    .string()
    .trim()
    .min(1, formatValidationMessage(MessageCode.ER001, FIELD_LABELS.FULLNAME_KANA))
    .max(125, formatValidationMessage(MessageCode.ER006, FIELD_LABELS.FULLNAME_KANA, '125'))
    .regex(
      KATAKANA_HALF_WIDTH_REGEX,
      formatValidationMessage(MessageCode.ER009, FIELD_LABELS.FULLNAME_KANA),
    ),

  // 4. Ngày sinh (employeeBirthDate) - Bắt buộc chọn / nhập (ER002), ngày hợp lệ (ER011)
  employeeBirthDate: z
    .string()
    .trim()
    .min(1, formatValidationMessage(MessageCode.ER002, FIELD_LABELS.BIRTH_DATE))
    .refine(isValidDate, {
      message: formatValidationMessage(MessageCode.ER011, FIELD_LABELS.BIRTH_DATE),
    }),

  // 5. Email (employeeEmail) - Bắt buộc (ER001), tối đa 125 (ER006), 1-byte nửa góc (ER008), định dạng email (ER005)
  employeeEmail: z
    .string()
    .trim()
    .min(1, formatValidationMessage(MessageCode.ER001, FIELD_LABELS.EMAIL))
    .max(125, formatValidationMessage(MessageCode.ER006, FIELD_LABELS.EMAIL, '125'))
    .regex(
      HALF_SIZE_REGEX,
      formatValidationMessage(MessageCode.ER008, FIELD_LABELS.EMAIL),
    )
    .refine(isValidEmail, {
      message: formatValidationMessage(MessageCode.ER005, FIELD_LABELS.EMAIL, EMAIL_FORMAT_TOKEN),
    }),

  // 6. Số điện thoại (employeeTelephone) - Bắt buộc (ER001), tối đa 50 (ER006), 1-byte nửa góc (ER008)
  employeeTelephone: z
    .string()
    .trim()
    .min(1, formatValidationMessage(MessageCode.ER001, FIELD_LABELS.TEL))
    .max(50, formatValidationMessage(MessageCode.ER006, FIELD_LABELS.TEL, '50'))
    .regex(
      HALF_SIZE_REGEX,
      formatValidationMessage(MessageCode.ER008, FIELD_LABELS.TEL),
    ),

  // 7. Các trường chứng chỉ tiếng Nhật (cấp field là chuỗi)
  certificationId: z.string(),
  certificationStartDate: z.string(),
  certificationEndDate: z.string(),
  certificationScore: z.string(),
};

/**
 * Kiểu dữ liệu tối thiểu cho phần kiểm tra Bằng cấp tiếng Nhật.
 */
interface CertificationFields {
  certificationId: string;
  certificationStartDate: string;
  certificationEndDate: string;
  certificationScore: string;
}

/**
 * Hàm kiểm tra hợp lệ Bằng cấp tiếng Nhật (dùng chung cho cả Add và Edit).
 * Chỉ kích hoạt kiểm tra khi người dùng CÓ chọn bằng cấp (certificationId không rỗng).
 */
function validateCertificationDetails(
  data: CertificationFields,
  ctx: z.RefinementCtx,
): void {
  if (isEmpty(data.certificationId)) {
    return;
  }

  // 1. Ngày cấp (certificationStartDate)
  const isStartDateValid = isValidDate(data.certificationStartDate);
  if (isEmpty(data.certificationStartDate)) {
    ctx.addIssue({
      code: 'custom',
      message: formatValidationMessage(MessageCode.ER002, FIELD_LABELS.START_DATE),
      path: ['certificationStartDate'],
    });
  } else if (!isStartDateValid) {
    ctx.addIssue({
      code: 'custom',
      message: formatValidationMessage(MessageCode.ER011, FIELD_LABELS.START_DATE),
      path: ['certificationStartDate'],
    });
  }

  // 2. Ngày hết hạn (certificationEndDate)
  const isEndDateValid = isValidDate(data.certificationEndDate);
  if (isEmpty(data.certificationEndDate)) {
    ctx.addIssue({
      code: 'custom',
      message: formatValidationMessage(MessageCode.ER002, FIELD_LABELS.END_DATE),
      path: ['certificationEndDate'],
    });
  } else if (!isEndDateValid) {
    ctx.addIssue({
      code: 'custom',
      message: formatValidationMessage(MessageCode.ER011, FIELD_LABELS.END_DATE),
      path: ['certificationEndDate'],
    });
  }

  // 3. So sánh Ngày hết hạn >= Ngày cấp (ER012)
  if (
    isStartDateValid &&
    isEndDateValid &&
    toTimestamp(data.certificationEndDate) < toTimestamp(data.certificationStartDate)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: MessageCode.ER012,
      path: ['certificationEndDate'],
    });
  }

  // 4. Điểm số (certificationScore) - Bắt buộc nhập (ER001), số nguyên dương (ER018)
  if (isEmpty(data.certificationScore)) {
    ctx.addIssue({
      code: 'custom',
      message: formatValidationMessage(MessageCode.ER001, FIELD_LABELS.SCORE),
      path: ['certificationScore'],
    });
  } else if (!isPositiveNumber(data.certificationScore)) {
    ctx.addIssue({
      code: 'custom',
      message: formatValidationMessage(MessageCode.ER018, FIELD_LABELS.SCORE),
      path: ['certificationScore'],
    });
  }
}

/**
 * ---------------------------------------------------------------------------
 * SCHEMA THÊM MỚI NHÂN VIÊN (ADD MODE - ADM004)
 * - Tên đăng nhập: Bắt buộc, tối đa 50, đúng format không bắt đầu bằng số (ER019).
 * - Mật khẩu: Bắt buộc (ER001), độ dài 8 - 50 (ER007).
 * - Xác nhận mật khẩu: Bắt buộc (ER001), phải trùng khớp với mật khẩu (ER017).
 * ---------------------------------------------------------------------------
 */
export const employeeCreateSchema = z
  .object({
    ...commonEmployeeFields,

    // Tên đăng nhập (employeeLoginId)
    employeeLoginId: z
      .string()
      .trim()
      .min(1, formatValidationMessage(MessageCode.ER001, FIELD_LABELS.LOGIN_ID))
      .max(50, formatValidationMessage(MessageCode.ER006, FIELD_LABELS.LOGIN_ID, '50'))
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, MessageCode.ER019),

    // Mật khẩu (employeeLoginPassword)
    employeeLoginPassword: z
      .string()
      .min(1, formatValidationMessage(MessageCode.ER001, FIELD_LABELS.PASSWORD))
      .min(
        PASSWORD_MIN_LENGTH,
        formatValidationMessage(
          MessageCode.ER007,
          FIELD_LABELS.PASSWORD,
          PASSWORD_MIN_LENGTH,
          PASSWORD_MAX_LENGTH,
        ),
      )
      .max(
        PASSWORD_MAX_LENGTH,
        formatValidationMessage(
          MessageCode.ER007,
          FIELD_LABELS.PASSWORD,
          PASSWORD_MIN_LENGTH,
          PASSWORD_MAX_LENGTH,
        ),
      ),

    // Xác nhận mật khẩu (employeeLoginPasswordConfirm)
    employeeLoginPasswordConfirm: z
      .string()
      .min(1, formatValidationMessage(MessageCode.ER001, FIELD_LABELS.PASSWORD_CONFIRM)),
  })
  .superRefine((data, ctx) => {
    // Khớp mật khẩu (ER017)
    if (
      data.employeeLoginPasswordConfirm &&
      data.employeeLoginPasswordConfirm !== data.employeeLoginPassword
    ) {
      ctx.addIssue({
        code: 'custom',
        message: MessageCode.ER017,
        path: ['employeeLoginPasswordConfirm'],
      });
    }

    // Tái sử dụng logic kiểm tra chứng chỉ
    validateCertificationDetails(data, ctx);
  });

/**
 * Alias cho employeeCreateSchema để tương thích ngược với các file import cũ.
 */
export const employeeFormSchema = employeeCreateSchema;

/**
 * ---------------------------------------------------------------------------
 * SCHEMA CHỈNH SỬA NHÂN VIÊN (EDIT MODE - ADM004)
 * - Tên đăng nhập: Bị disabled / không cho phép sửa, hoàn toàn không kiểm tra validate.
 * - Mật khẩu: Tùy chọn (để trống nếu giữ nguyên mật khẩu cũ trong DB; nếu nhập thì kiểm tra 8-50).
 * - Xác nhận mật khẩu: Bắt buộc nếu có nhập mật khẩu và phải khớp nhau (ER017).
 * ---------------------------------------------------------------------------
 */
export const employeeEditSchema = z
  .object({
    ...commonEmployeeFields,

    // Tên đăng nhập ở Edit mode: cố định, không validate
    employeeLoginId: z.string().optional().default(''),

    // Mật khẩu khi Edit: cho phép để trống
    employeeLoginPassword: z
      .string()
      .refine(
        (val) => val === '' || (val.length >= PASSWORD_MIN_LENGTH && val.length <= PASSWORD_MAX_LENGTH),
        {
          message: formatValidationMessage(
            MessageCode.ER007,
            FIELD_LABELS.PASSWORD,
            PASSWORD_MIN_LENGTH,
            PASSWORD_MAX_LENGTH,
          ),
        },
      ),

    employeeLoginPasswordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    // Kiểm tra khớp mật khẩu khi Edit
    if (data.employeeLoginPassword) {
      if (!data.employeeLoginPasswordConfirm) {
        ctx.addIssue({
          code: 'custom',
          message: formatValidationMessage(MessageCode.ER001, FIELD_LABELS.PASSWORD_CONFIRM),
          path: ['employeeLoginPasswordConfirm'],
        });
      } else if (data.employeeLoginPasswordConfirm !== data.employeeLoginPassword) {
        ctx.addIssue({
          code: 'custom',
          message: MessageCode.ER017,
          path: ['employeeLoginPasswordConfirm'],
        });
      }
    } else if (data.employeeLoginPasswordConfirm) {
      ctx.addIssue({
        code: 'custom',
        message: MessageCode.ER017,
        path: ['employeeLoginPasswordConfirm'],
      });
    }

    // Tái sử dụng logic kiểm tra chứng chỉ
    validateCertificationDetails(data, ctx);
  });

/**
 * Type inference cho dữ liệu form nhân viên
 */
export type EmployeeFormData = z.infer<typeof employeeCreateSchema>;
export { ERR_CODE, getErrorMessage };

