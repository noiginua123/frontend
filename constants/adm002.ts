export const ADM002_PAGE_SIZE = 20;

export const EMPLOYEE_NAME_MAX_LENGTH = 125;

export const EMPLOYEE_NAME_DISPLAY_LENGTH = 22;

export const ADM002_MESSAGES = {
  departmentLoadError: '部門を取得できません',
  employeeLoadError: '従業員を取得できません',
  employeeNotFound: '検索条件に該当するユーザが見つかりません。',
  loading: '読み込み中...',
  fullnameMaxLength: `${EMPLOYEE_NAME_MAX_LENGTH}桁以内の「氏名」を入力してください。`,
} as const;
