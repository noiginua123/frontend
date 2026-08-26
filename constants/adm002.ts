import { ERR_MSG_TEMPLATES, FIELD_LABELS, formatMessage, INFO_MESSAGES } from './messages';

export const ADM002_PAGE_SIZE = 20;

export const ADM002_SESSION_KEY = 'adm002_filter_state';

export const EMPLOYEE_NAME_MAX_LENGTH = 125;

export const EMPLOYEE_NAME_DISPLAY_LENGTH = 20;

export const ADM002_MESSAGES = {
  departmentLoadError: '部門を取得できません',
  employeeLoadError: '従業員を取得できません',
  employeeNotFound: INFO_MESSAGES.MSG005,
  loading: '読み込み中...',
  fullnameMaxLength: formatMessage(ERR_MSG_TEMPLATES.ER006, EMPLOYEE_NAME_MAX_LENGTH, FIELD_LABELS.FULLNAME),
} as const;
