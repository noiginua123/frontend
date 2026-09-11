import {
  ERR_CODE,
  ERR_MSG_TEMPLATES,
  FIELD_LABELS,
  formatMessage,
  getErrorMessage,
  INFO_MESSAGES,
  MSG_CODE,
  MessageCode,
  formatValidationMessage,
} from '@/constants/messages';

describe('Messages and Constants', () => {
  describe('ERR_CODE and ERR_MSG_TEMPLATES', () => {
    it('should define all error codes ER001 to ER023', () => {
      for (let i = 1; i <= 23; i++) {
        const codeKey = `ER${String(i).padStart(3, '0')}` as keyof typeof ERR_CODE;
        expect(ERR_CODE[codeKey]).toBe(codeKey);
        expect(ERR_MSG_TEMPLATES[codeKey]).toBeDefined();
      }
    });
  });

  describe('MSG_CODE and INFO_MESSAGES', () => {
    it('should define all info message codes MSG001 to MSG005', () => {
      for (let i = 1; i <= 5; i++) {
        const codeKey = `MSG${String(i).padStart(3, '0')}` as keyof typeof MSG_CODE;
        expect(MSG_CODE[codeKey]).toBe(codeKey);
        expect(INFO_MESSAGES[codeKey]).toBeDefined();
      }
    });
  });

  describe('formatMessage', () => {
    it('should correctly replace positional parameters {0}, {1}', () => {
      const template = '{0}桁以内の「{1}」を入力してください。';
      const formatted = formatMessage(template, 125, FIELD_LABELS.FULLNAME);
      expect(formatted).toBe('125桁以内の「氏名」を入力してください。');
    });

    it('should return empty string if template is empty or undefined', () => {
      expect(formatMessage('')).toBe('');
    });

    it('should leave unreplaced placeholders if params not supplied', () => {
      const template = '「{0}」を入力してください。 {1}';
      expect(formatMessage(template, '氏名')).toBe('「氏名」を入力してください。 {1}');
    });
  });

  describe('getErrorMessage', () => {
    it('should format message with given code and params', () => {
      const msg = getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.LOGIN_ID]);
      expect(msg).toBe('「アカウント名」を入力してください。');
    });

    it('should return default system error message for unknown error code', () => {
      const msg = getErrorMessage('UNKNOWN_CODE');
      expect(msg).toBe('システムエラーが発生しました。');
    });
  });

  describe('MessageCode and formatValidationMessage', () => {
    it('MessageCode should return template/message directly', () => {
      expect(MessageCode.ER019).toBe(getErrorMessage(ERR_CODE.ER019));
      expect(MessageCode.ER017).toBe(getErrorMessage(ERR_CODE.ER017));
    });

    it('formatValidationMessage should format message with ER001 and field label', () => {
      expect(formatValidationMessage(MessageCode.ER001, FIELD_LABELS.LOGIN_ID)).toBe(
        '「アカウント名」を入力してください。',
      );
    });

    it('formatValidationMessage should support flexible params order for ER006', () => {
      expect(
        formatValidationMessage(MessageCode.ER006, FIELD_LABELS.LOGIN_ID, '50'),
      ).toBe('50桁以内の「アカウント名」を入力してください。');
      expect(
        formatValidationMessage(ERR_CODE.ER006, 50, FIELD_LABELS.LOGIN_ID),
      ).toBe('50桁以内の「アカウント名」を入力してください。');
    });
  });
});
