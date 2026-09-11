/**
 * Mã lỗi nghiệp vụ theo tài liệu thiết kế (ERR_MSG: ER001 - ER023).
 */
export const ERR_CODE = {
  ER001: 'ER001',
  ER002: 'ER002',
  ER003: 'ER003',
  ER004: 'ER004',
  ER005: 'ER005',
  ER006: 'ER006',
  ER007: 'ER007',
  ER008: 'ER008',
  ER009: 'ER009',
  ER010: 'ER010',
  ER011: 'ER011',
  ER012: 'ER012',
  ER013: 'ER013',
  ER014: 'ER014',
  ER015: 'ER015',
  ER016: 'ER016',
  ER017: 'ER017',
  ER018: 'ER018',
  ER019: 'ER019',
  ER020: 'ER020',
  ER021: 'ER021',
  ER022: 'ER022',
  ER023: 'ER023',
} as const;

export type ErrCode = (typeof ERR_CODE)[keyof typeof ERR_CODE];

/**
 * Mã thông báo nghiệp vụ theo tài liệu thiết kế (MSG: MSG001 - MSG005).
 */
export const MSG_CODE = {
  MSG001: 'MSG001',
  MSG002: 'MSG002',
  MSG003: 'MSG003',
  MSG004: 'MSG004',
  MSG005: 'MSG005',
} as const;

export type MsgCode = (typeof MSG_CODE)[keyof typeof MSG_CODE];

/**
 * Nhãn tên hạng mục trên màn hình (dùng trong message).
 */
export const FIELD_LABELS = {
  ID: 'ＩＤ',
  LOGIN_ID: 'アカウント名',
  FULLNAME: '氏名',
  FULLNAME_KANA: 'カタカナ氏名',
  BIRTH_DATE: '生年月日',
  EMAIL: 'メールアドレス',
  TEL: '電話番号',
  PASSWORD: 'パスワード',
  PASSWORD_CONFIRM: 'パスワード（確認）',
  DEPARTMENT_ID: '部門ID',
  GROUP: 'グループ',
  CERTIFICATION: '資格',
  START_DATE: '資格交付日',
  END_DATE: '失効日',
  SCORE: '点数',
} as const;

/**
 * Template message lỗi tiếng Nhật (ER001 - ER023).
 */
export const ERR_MSG_TEMPLATES: Record<ErrCode, string> = {
  [ERR_CODE.ER001]: '「{0}」を入力してください。',
  [ERR_CODE.ER002]: '「{0}」を選択してください。',
  [ERR_CODE.ER003]: '「{0}」は既に存在しています。',
  [ERR_CODE.ER004]: '「{0}」は存在していません。',
  [ERR_CODE.ER005]: '「{0}」を{1}形式で入力してください。',
  [ERR_CODE.ER006]: '{0}桁以内の「{1}」を入力してください。',
  [ERR_CODE.ER007]: '「{0}」を{1}＜＝桁数、＜＝{2}桁で入力してください。',
  [ERR_CODE.ER008]: '「{0}」に半角英数を入力してください。',
  [ERR_CODE.ER009]: '「{0}」をカタカナで入力してください。',
  [ERR_CODE.ER010]: '「{0}」をひらがなで入力してください。',
  [ERR_CODE.ER011]: '「{0}」は無効になっています。',
  [ERR_CODE.ER012]: '「失効日」は「資格交付日」より未来の日で入力してください。',
  [ERR_CODE.ER013]: '該当するユーザは存在していません。',
  [ERR_CODE.ER014]: '該当するユーザは存在していません。',
  [ERR_CODE.ER015]: 'システムエラーが発生しました。',
  [ERR_CODE.ER016]: '「アカウント名」または「パスワード」は不正です。',
  [ERR_CODE.ER017]: '「パスワード（確認）」が不正です。',
  [ERR_CODE.ER018]: '「{0}」は半角で入力してください。',
  [ERR_CODE.ER019]: '[アカウント名]は(a-z, A-Z, 0-9 と _)の桁のみです。最初の桁は数字ではない。',
  [ERR_CODE.ER020]: '管理者ユーザを削除することはできません。',
  [ERR_CODE.ER021]: 'ソートは (ASC, DESC) でなければなりません。',
  [ERR_CODE.ER022]: 'ページが見つかりません。',
  [ERR_CODE.ER023]: 'システムエラーが発生しました。',
};

/**
 * Message thông báo (MSG001 - MSG005).
 */
export const INFO_MESSAGES: Record<MsgCode, string> = {
  [MSG_CODE.MSG001]: 'ユーザの登録が完了しました。',
  [MSG_CODE.MSG002]: 'ユーザの更新が完了しました。',
  [MSG_CODE.MSG003]: 'ユーザの削除が完了しました。',
  [MSG_CODE.MSG004]: '削除しますが、よろしいでしょうか。',
  [MSG_CODE.MSG005]: '検索条件に該当するユーザが見つかりません。',
};

/**
 * Định dạng chuỗi message với danh sách tham số {0}, {1}, {2}...
 *
 * @param template Chuỗi mẫu có chứa placeholder {0}, {1}...
 * @param params Các tham số cần thay thế vào placeholder
 * @return Chuỗi đã được thay thế tham số
 */
export function formatMessage(template: string, ...params: (string | number)[]): string {
  if (!template) {
    return '';
  }
  return template.replace(/\{(\d+)\}/g, (match, index) => {
    const paramIndex = Number(index);
    return paramIndex < params.length ? String(params[paramIndex]) : match;
  });
}

/**
 * Lấy message lỗi đã được format từ mã lỗi và các tham số.
 *
 * @param code Mã lỗi (ví dụ: ER001, ER006)
 * @param params Danh sách tham số tương ứng với placeholder
 * @return Nội dung thông báo lỗi
 */
export function getErrorMessage(code: string, params: (string | number)[] = []): string {
  const template = ERR_MSG_TEMPLATES[code as ErrCode] || ERR_MSG_TEMPLATES.ER023;
  return formatMessage(template, ...params);
}

/**
 * Proxy tiện ích cho ERR_CODE trả về chuỗi thông báo tương ứng với mã lỗi,
 * hỗ trợ khai báo schema validation ngắn gọn trực tiếp (ví dụ: MessageCode.ER019).
 */
export const MessageCode: Record<keyof typeof ERR_CODE, string> = new Proxy(
  ERR_CODE as unknown as Record<keyof typeof ERR_CODE, string>,
  {
    get(target, prop: string) {
      if (prop in target) {
        const code = target[prop as keyof typeof ERR_CODE];
        return getErrorMessage(code);
      }
      return prop;
    },
  },
);

/**
 * Định dạng chuỗi message validation theo mã lỗi hoặc template cùng các tham số.
 * Hỗ trợ linh hoạt cả truyền theo mã lỗi (MessageCode.ER001) lẫn thứ tự tham số linh hoạt.
 *
 * @param codeOrTemplate Mã lỗi hoặc template có chứa placeholder {0}, {1}...
 * @param params Danh sách tham số tương ứng với placeholder
 * @return Nội dung thông báo lỗi đã được thay thế tham số
 */
export function formatValidationMessage(
  codeOrTemplate: string,
  ...params: (string | number)[]
): string {
  let template = codeOrTemplate;
  if (codeOrTemplate in ERR_MSG_TEMPLATES) {
    template = ERR_MSG_TEMPLATES[codeOrTemplate as ErrCode];
  }

  // Hỗ trợ hoán đổi thứ tự tham số nếu truyền theo thứ tự [label, max] cho template ER006: '{0}桁以内の「{1}」を入力してください。'
  if (template.includes('{0}桁以内の「{1}」') && params.length >= 2) {
    const [p0, p1] = params;
    if (typeof p0 === 'string' && (typeof p1 === 'number' || /^\d+$/.test(String(p1)))) {
      return formatMessage(template, p1, p0);
    }
  }

  return formatMessage(template, ...params);
}
