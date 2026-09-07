import { ERR_CODE, FIELD_LABELS } from './messages';

/**
 * Khóa lưu dữ liệu form ADM004 giữa các bước nhập -> xác nhận (sessionStorage).
 */
export const ADM004_SESSION_KEY = 'adm004_employee_form';

/**
 * Khóa lưu message thành công để hiển thị ở màn hình hoàn tất ADM006.
 */
export const ADM006_MESSAGE_KEY = 'adm006_success_message';

/**
 * Khóa lưu thông báo lỗi khi bị điều hướng từ ADM005 về ADM004 (sessionStorage).
 */
export const ADM004_ERROR_KEY = 'adm004_error_message';

/**
 * Các đường dẫn điều hướng của luồng thêm mới nhân viên.
 */
export const ADM004_ROUTES = {
  input: '/employees/adm004',
  confirm: '/employees/adm005',
  complete: '/employees/adm006',
  list: '/employees/adm002',
} as const;

/**
 * Message dùng riêng cho luồng ADM004.
 */
export const ADM004_MESSAGES = {
  masterLoadError: 'マスタデータを取得できません',
  noFormData: '入力データが見つかりません。',
} as const;

/**
 * Ánh xạ nhãn trường (tiếng Nhật) trong param message lỗi -> tên field trên form,
 * dùng để gắn lỗi backend vào đúng ô nhập. Với ER006 nhãn nằm ở param thứ 2 nên
 * hook sẽ quét toàn bộ param để tìm nhãn khớp.
 */
export const LABEL_TO_FIELD: Record<string, string> = {
  [FIELD_LABELS.LOGIN_ID]: 'employeeLoginId',
  [FIELD_LABELS.GROUP]: 'departmentId',
  [FIELD_LABELS.DEPARTMENT_ID]: 'departmentId',
  [FIELD_LABELS.FULLNAME]: 'employeeName',
  [FIELD_LABELS.FULLNAME_KANA]: 'employeeNameKana',
  [FIELD_LABELS.BIRTH_DATE]: 'employeeBirthDate',
  [FIELD_LABELS.EMAIL]: 'employeeEmail',
  [FIELD_LABELS.TEL]: 'employeeTelephone',
  [FIELD_LABELS.PASSWORD]: 'employeeLoginPassword',
  [FIELD_LABELS.PASSWORD_CONFIRM]: 'employeeLoginPasswordConfirm',
  [FIELD_LABELS.CERTIFICATION]: 'certificationId',
  [FIELD_LABELS.START_DATE]: 'certificationStartDate',
  [FIELD_LABELS.END_DATE]: 'certificationEndDate',
  [FIELD_LABELS.SCORE]: 'certificationScore',
};

/**
 * Ánh xạ các mã lỗi không có param nhãn -> field tương ứng.
 */
export const CODE_TO_FIELD: Record<string, string> = {
  [ERR_CODE.ER012]: 'certificationEndDate',
  [ERR_CODE.ER019]: 'employeeLoginId',
  [ERR_CODE.ER017]: 'employeeLoginPasswordConfirm',
};
