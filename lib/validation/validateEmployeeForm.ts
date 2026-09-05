import { z } from 'zod';
import { ERR_CODE, FIELD_LABELS, getErrorMessage } from '@/constants/messages';

// Giới hạn độ dài (đồng bộ với backend Constants).
const MAX_LENGTH_50 = 50;
const MAX_LENGTH_125 = 125;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 50;
const SCORE_MAX_LENGTH = 3;
const DATE_FORMAT = 'yyyy/MM/dd';
const EMAIL_FORMAT_TOKEN = 'email';

// Regex chỉ cho phép Katakana half-size (半角カタカナ \uFF65-\uFF9F) và khoảng trắng half-width
const KATAKANA_REGEX = /^[\uFF65-\uFF9F ]+$/;
const HALF_SIZE_REGEX = /^[\u0020-\u007E]+$/;
const LOGIN_ID_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const DIGITS_REGEX = /^[0-9]+$/;
const DATE_REGEX = /^\d{4}\/\d{2}\/\d{2}$/;

function isEmpty(value: string | undefined | null): boolean {
  return value == null || value.trim() === '';
}

function codePointLength(value: string): number {
  return Array.from(value.trim()).length;
}

function isMaxLength(value: string, max: number): boolean {
  return codePointLength(value) > max;
}

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed.includes('@') || !trimmed.includes('.')) {
    return false;
  }
  if (trimmed.startsWith('@') || trimmed.startsWith('.')) {
    return false;
  }
  return !trimmed.includes('@.') && !trimmed.includes('.@');
}

function isValidDate(value: string): boolean {
  const trimmed = value.trim();
  if (!DATE_REGEX.test(trimmed)) {
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

function toDate(value: string): number {
  const [year, month, day] = value.trim().split('/').map(Number);
  return new Date(year, month - 1, day).getTime();
}

function isEndBeforeStart(startDate: string, endDate: string): boolean {
  return toDate(endDate) < toDate(startDate);
}

function isPositiveNumber(value: string): boolean {
  const trimmed = value.trim();
  if (!DIGITS_REGEX.test(trimmed)) {
    return false;
  }
  return Number(trimmed) > 0;
}

type FieldName =
  | 'employeeLoginId'
  | 'departmentId'
  | 'employeeName'
  | 'employeeNameKana'
  | 'employeeBirthDate'
  | 'employeeEmail'
  | 'employeeTelephone'
  | 'employeeLoginPassword'
  | 'employeeLoginPasswordConfirm'
  | 'certificationId'
  | 'certificationStartDate'
  | 'certificationEndDate'
  | 'certificationScore';

function pushIssue(ctx: z.RefinementCtx, field: FieldName, message: string): void {
  ctx.addIssue({ code: 'custom', message, path: [field] });
}

/**
 * Schema kiểm tra dữ liệu thêm mới nhân viên (ADM004) phía client.
 *
 * <p>Toàn bộ trường là chuỗi (giá trị từ input). Thứ tự kiểm tra từng trường
 * khớp với backend EmployeeValidator để hiển thị đúng mã lỗi đầu tiên.</p>
 */
export const validateEmployeeForm = z
  .object({
    employeeLoginId: z.string(),
    departmentId: z.string(),
    employeeName: z.string(),
    employeeNameKana: z.string(),
    employeeBirthDate: z.string(),
    employeeEmail: z.string(),
    employeeTelephone: z.string(),
    employeeLoginPassword: z.string(),
    employeeLoginPasswordConfirm: z.string(),
    certificationId: z.string(),
    certificationStartDate: z.string(),
    certificationEndDate: z.string(),
    certificationScore: z.string(),
  })
  .superRefine((data, ctx) => {
    // 1. Login ID: bắt buộc -> tối đa 50 -> đúng định dạng
    if (isEmpty(data.employeeLoginId)) {
      pushIssue(ctx, 'employeeLoginId', getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.LOGIN_ID]));
    } else if (isMaxLength(data.employeeLoginId, MAX_LENGTH_50)) {
      pushIssue(ctx, 'employeeLoginId', getErrorMessage(ERR_CODE.ER006, [MAX_LENGTH_50, FIELD_LABELS.LOGIN_ID]));
    } else if (!LOGIN_ID_REGEX.test(data.employeeLoginId.trim())) {
      pushIssue(ctx, 'employeeLoginId', getErrorMessage(ERR_CODE.ER019));
    }

    // 2. Nhóm (phòng ban): bắt buộc chọn
    if (isEmpty(data.departmentId)) {
      pushIssue(ctx, 'departmentId', getErrorMessage(ERR_CODE.ER002, [FIELD_LABELS.GROUP]));
    }

    // 3. Họ tên: bắt buộc -> tối đa 125
    if (isEmpty(data.employeeName)) {
      pushIssue(ctx, 'employeeName', getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.FULLNAME]));
    } else if (isMaxLength(data.employeeName, MAX_LENGTH_125)) {
      pushIssue(ctx, 'employeeName', getErrorMessage(ERR_CODE.ER006, [MAX_LENGTH_125, FIELD_LABELS.FULLNAME]));
    }

    // 4. Tên kana: bắt buộc -> tối đa 125 -> đúng katakana
    if (isEmpty(data.employeeNameKana)) {
      pushIssue(ctx, 'employeeNameKana', getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.FULLNAME_KANA]));
    } else if (isMaxLength(data.employeeNameKana, MAX_LENGTH_125)) {
      pushIssue(ctx, 'employeeNameKana', getErrorMessage(ERR_CODE.ER006, [MAX_LENGTH_125, FIELD_LABELS.FULLNAME_KANA]));
    } else if (!KATAKANA_REGEX.test(data.employeeNameKana.trim())) {
      pushIssue(ctx, 'employeeNameKana', getErrorMessage(ERR_CODE.ER009, [FIELD_LABELS.FULLNAME_KANA]));
    }

    // 5. Ngày sinh: bắt buộc -> đúng định dạng
    if (isEmpty(data.employeeBirthDate)) {
      pushIssue(ctx, 'employeeBirthDate', getErrorMessage(ERR_CODE.ER002, [FIELD_LABELS.BIRTH_DATE]));
    } else if (!isValidDate(data.employeeBirthDate)) {
      pushIssue(ctx, 'employeeBirthDate', getErrorMessage(ERR_CODE.ER011, [FIELD_LABELS.BIRTH_DATE, DATE_FORMAT]));
    }

    // 6. Email: bắt buộc -> tối đa 125 -> đúng định dạng
    if (isEmpty(data.employeeEmail)) {
      pushIssue(ctx, 'employeeEmail', getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.EMAIL]));
    } else if (isMaxLength(data.employeeEmail, MAX_LENGTH_125)) {
      pushIssue(ctx, 'employeeEmail', getErrorMessage(ERR_CODE.ER006, [MAX_LENGTH_125, FIELD_LABELS.EMAIL]));
    } else if (!isValidEmail(data.employeeEmail)) {
      pushIssue(ctx, 'employeeEmail', getErrorMessage(ERR_CODE.ER005, [FIELD_LABELS.EMAIL, EMAIL_FORMAT_TOKEN]));
    }

    // 7. Điện thoại: bắt buộc -> tối đa 50 -> chỉ ký tự 1 byte
    if (isEmpty(data.employeeTelephone)) {
      pushIssue(ctx, 'employeeTelephone', getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.TEL]));
    } else if (isMaxLength(data.employeeTelephone, MAX_LENGTH_50)) {
      pushIssue(ctx, 'employeeTelephone', getErrorMessage(ERR_CODE.ER006, [MAX_LENGTH_50, FIELD_LABELS.TEL]));
    } else if (!HALF_SIZE_REGEX.test(data.employeeTelephone.trim())) {
      pushIssue(ctx, 'employeeTelephone', getErrorMessage(ERR_CODE.ER008, [FIELD_LABELS.TEL]));
    }

    // 8. Mật khẩu: bắt buộc -> độ dài 8..50
    if (isEmpty(data.employeeLoginPassword)) {
      pushIssue(ctx, 'employeeLoginPassword', getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.PASSWORD]));
    } else {
      const passwordLength = data.employeeLoginPassword.length;
      if (passwordLength < PASSWORD_MIN_LENGTH || passwordLength > PASSWORD_MAX_LENGTH) {
        pushIssue(
          ctx,
          'employeeLoginPassword',
          getErrorMessage(ERR_CODE.ER007, [FIELD_LABELS.PASSWORD, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH]),
        );
      }
    }

    // 9. Xác nhận mật khẩu: bắt buộc -> phải khớp mật khẩu
    if (isEmpty(data.employeeLoginPasswordConfirm)) {
      pushIssue(ctx, 'employeeLoginPasswordConfirm', getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.PASSWORD_CONFIRM]));
    } else if (data.employeeLoginPasswordConfirm !== data.employeeLoginPassword) {
      pushIssue(ctx, 'employeeLoginPasswordConfirm', getErrorMessage(ERR_CODE.ER017));
    }

    // 10. Chứng chỉ: chỉ kiểm tra khi đã chọn 資格
    if (!isEmpty(data.certificationId)) {
      if (isEmpty(data.certificationStartDate)) {
        pushIssue(ctx, 'certificationStartDate', getErrorMessage(ERR_CODE.ER002, [FIELD_LABELS.START_DATE]));
      } else if (!isValidDate(data.certificationStartDate)) {
        pushIssue(ctx, 'certificationStartDate', getErrorMessage(ERR_CODE.ER011, [FIELD_LABELS.START_DATE, DATE_FORMAT]));
      }

      if (isEmpty(data.certificationEndDate)) {
        pushIssue(ctx, 'certificationEndDate', getErrorMessage(ERR_CODE.ER002, [FIELD_LABELS.END_DATE]));
      } else if (!isValidDate(data.certificationEndDate)) {
        pushIssue(ctx, 'certificationEndDate', getErrorMessage(ERR_CODE.ER011, [FIELD_LABELS.END_DATE, DATE_FORMAT]));
      } else if (
        isValidDate(data.certificationStartDate) &&
        isEndBeforeStart(data.certificationStartDate, data.certificationEndDate)
      ) {
        pushIssue(ctx, 'certificationEndDate', getErrorMessage(ERR_CODE.ER012));
      }

      if (isEmpty(data.certificationScore)) {
        pushIssue(ctx, 'certificationScore', getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.SCORE]));
      } else if (!isPositiveNumber(data.certificationScore)) {
        pushIssue(ctx, 'certificationScore', getErrorMessage(ERR_CODE.ER018, [FIELD_LABELS.SCORE]));
      } else if (isMaxLength(data.certificationScore, SCORE_MAX_LENGTH)) {
        pushIssue(ctx, 'certificationScore', getErrorMessage(ERR_CODE.ER006, [SCORE_MAX_LENGTH, FIELD_LABELS.SCORE]));
      }
    }
  });

export type validateEmployeeForm = z.infer<typeof validateEmployeeForm>;
