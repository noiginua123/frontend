import { INFO_MESSAGES, MSG_CODE } from './messages';

/**
 * Các đường dẫn điều hướng của màn hình chi tiết nhân viên ADM003.
 */
export const ADM003_ROUTES = {
  detail: '/employees/adm003',
  list: '/employees/adm002',
  edit: (id: number | string) => `/employees/adm004?id=${id}`,
} as const;

/**
 * Thông báo dùng riêng cho màn hình ADM003.
 */
export const ADM003_MESSAGES = {
  confirmDelete: INFO_MESSAGES[MSG_CODE.MSG004], // 削除しますが、よろしいでしょうか。
  deleteSuccess: INFO_MESSAGES[MSG_CODE.MSG003], // ユーザの削除が完了しました。
  loading: '読み込み中...',
} as const;
