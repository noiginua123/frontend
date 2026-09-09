import {
  ERR_CODE,
  ERR_MSG_TEMPLATES,
  FIELD_LABELS,
  formatMessage,
  INFO_MESSAGES,
  MSG_CODE,
} from './messages';
import { SortField } from '@/types/employee';

/** Số bản ghi trên mỗi trang ở màn hình danh sách nhân viên. */
export const EMPLOYEE_PAGE_SIZE = 20;
export const ADM002_PAGE_SIZE = EMPLOYEE_PAGE_SIZE;

/** Độ dài tối đa tên nhân viên khi nhập liệu. */
export const EMPLOYEE_NAME_MAX_LENGTH = 125;

/** Độ dài hiển thị rút gọn tối đa tên nhân viên trên bảng danh sách. */
export const EMPLOYEE_NAME_DISPLAY_LENGTH = 20;

/** Cột sắp xếp mặc định của bảng nhân viên. */
export const DEFAULT_PRIORITY_SORT_FIELD: SortField = 'employeeName';

/** Các cột hỗ trợ sắp xếp trên bảng danh sách nhân viên. */
export const EMPLOYEE_SORT_FIELDS = {
  EMPLOYEE_NAME: 'employeeName' as const,
  CERTIFICATION_NAME: 'certificationName' as const,
  END_DATE: 'endDate' as const,
};
export const ADM002_SORT_FIELDS = EMPLOYEE_SORT_FIELDS;

/**
 * Ánh xạ nhãn trường (tiếng Nhật) trong param message lỗi -> tên field trên form,
 * dùng để gắn lỗi backend vào đúng ô nhập.
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

/** Thông báo dùng trong toàn bộ luồng quản lý nhân viên (ADM002 - ADM006). */
export const EMPLOYEE_MESSAGES = {
  loading: '読み込み中...',
  departmentLoadError: '部門を取得できません',
  employeeLoadError: '従業員を取得できません',
  masterLoadError: 'マスタデータを取得できません',
  employeeNotFound: INFO_MESSAGES[MSG_CODE.MSG005],
  noFormData: '入力データが見つかりません。',
  fullnameMaxLength: formatMessage(ERR_MSG_TEMPLATES.ER006, EMPLOYEE_NAME_MAX_LENGTH, FIELD_LABELS.FULLNAME),
  confirmDelete: INFO_MESSAGES[MSG_CODE.MSG004], // 削除しますが、よろしいでしょうか。
  deleteSuccess: INFO_MESSAGES[MSG_CODE.MSG003], // ユーザの削除が完了しました。
} as const;

/** Alias tương thích ngược */
export const ADM002_MESSAGES = EMPLOYEE_MESSAGES;
export const ADM003_MESSAGES = EMPLOYEE_MESSAGES;
export const ADM004_MESSAGES = EMPLOYEE_MESSAGES;
