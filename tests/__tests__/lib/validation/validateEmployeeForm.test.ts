import { ERR_CODE, FIELD_LABELS, getErrorMessage } from '@/constants/messages';
import { EMAIL_FORMAT_TOKEN } from '@/utils/validation';
import {
  employeeFormSchema,
  employeeEditSchema,
  type EmployeeFormData,
} from '@/lib/validation/validateEmployeeForm';

const VALID_FORM: EmployeeFormData = {
  employeeLoginId: 'new_user',
  departmentId: '1',
  employeeName: 'Nguyen Van A',
  employeeNameKana: 'ｱｲｳｴｵ',
  employeeBirthDate: '2000/01/01',
  employeeEmail: 'test@example.com',
  employeeTelephone: '0123456789',
  employeeLoginPassword: 'password123',
  employeeLoginPasswordConfirm: 'password123',
  certificationId: '',
  certificationStartDate: '',
  certificationEndDate: '',
  certificationScore: '',
};

function getFieldMessages(
  overrides: Partial<EmployeeFormData>,
  field: keyof EmployeeFormData,
): string[] {
  const result = employeeFormSchema.safeParse({ ...VALID_FORM, ...overrides });
  if (result.success) {
    return [];
  }

  const issues = result.error.issues.filter((issue) => issue.path[0] === field);
  return issues.length > 0 ? [issues[0].message] : [];
}

describe('employeeFormSchema', () => {
  it('accepts a valid form without a certification', () => {
    expect(employeeFormSchema.safeParse(VALID_FORM).success).toBe(true);
  });

  it('returns only the required error for an empty login ID', () => {
    expect(getFieldMessages({ employeeLoginId: ' ' }, 'employeeLoginId')).toEqual([
      getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.LOGIN_ID]),
    ]);
  });

  it('validates the login ID format after required and max-length rules', () => {
    expect(getFieldMessages({ employeeLoginId: '1invalid' }, 'employeeLoginId')).toEqual([
      getErrorMessage(ERR_CODE.ER019),
    ]);
  });

  it('counts Unicode code points consistently with the backend', () => {
    expect(
      getFieldMessages(
        { employeeName: '😀'.repeat(125) },
        'employeeName',
      ),
    ).toEqual([]);
  });

  it('accepts employeeNameKana with exactly 125 half-width Katakana characters', () => {
    expect(
      getFieldMessages(
        { employeeNameKana: 'ｱ'.repeat(125) },
        'employeeNameKana',
      ),
    ).toEqual([]);
  });

  it('rejects employeeNameKana with 126 half-width Katakana characters with ER006', () => {
    expect(
      getFieldMessages(
        { employeeNameKana: 'ｱ'.repeat(126) },
        'employeeNameKana',
      ),
    ).toEqual([
      getErrorMessage(ERR_CODE.ER006, ['125', FIELD_LABELS.FULLNAME_KANA]),
    ]);
  });

  it('validates employeeEmail with ER008 for full-width characters and ER005 for invalid format', () => {
    expect(
      getFieldMessages(
        { employeeEmail: 'ｔｅｓｔ＠ｅｘａｍｐｌｅ．ｃｏｍ' },
        'employeeEmail',
      ),
    ).toEqual([
      getErrorMessage(ERR_CODE.ER008, [FIELD_LABELS.EMAIL]),
    ]);

    expect(
      getFieldMessages(
        { employeeEmail: 'テスト@example.com' },
        'employeeEmail',
      ),
    ).toEqual([
      getErrorMessage(ERR_CODE.ER008, [FIELD_LABELS.EMAIL]),
    ]);

    expect(
      getFieldMessages(
        { employeeEmail: 'invalid-email' },
        'employeeEmail',
      ),
    ).toEqual([
      getErrorMessage(ERR_CODE.ER005, [FIELD_LABELS.EMAIL, EMAIL_FORMAT_TOKEN]),
    ]);
  });

  it('rejects an invalid calendar date', () => {
    expect(
      getFieldMessages(
        { employeeBirthDate: '2024/02/30' },
        'employeeBirthDate',
      ),
    ).toEqual([
      getErrorMessage(ERR_CODE.ER011, [FIELD_LABELS.BIRTH_DATE]),
    ]);
  });

  it('requires the confirmation password and does not add a mismatch error', () => {
    expect(
      getFieldMessages(
        { employeeLoginPasswordConfirm: '' },
        'employeeLoginPasswordConfirm',
      ),
    ).toEqual([
      getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.PASSWORD_CONFIRM]),
    ]);
  });

  it('rejects a confirmation password that does not match', () => {
    expect(
      getFieldMessages(
        { employeeLoginPasswordConfirm: 'different-password' },
        'employeeLoginPasswordConfirm',
      ),
    ).toEqual([getErrorMessage(ERR_CODE.ER017)]);
  });

  it('ignores certification detail fields when no certification is selected', () => {
    const result = employeeFormSchema.safeParse({
      ...VALID_FORM,
      certificationStartDate: 'invalid',
      certificationEndDate: 'invalid',
      certificationScore: 'invalid',
    });

    expect(result.success).toBe(true);
  });

  it('requires all certification details after a certification is selected', () => {
    const result = employeeFormSchema.safeParse({
      ...VALID_FORM,
      certificationId: '1',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        certificationStartDate: [
          getErrorMessage(ERR_CODE.ER002, [FIELD_LABELS.START_DATE]),
        ],
        certificationEndDate: [
          getErrorMessage(ERR_CODE.ER002, [FIELD_LABELS.END_DATE]),
        ],
        certificationScore: [
          getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.SCORE]),
        ],
      });
    }
  });

  it('rejects a certification end date before its start date', () => {
    expect(
      getFieldMessages(
        {
          certificationId: '1',
          certificationStartDate: '2025/01/02',
          certificationEndDate: '2025/01/01',
          certificationScore: '900',
        },
        'certificationEndDate',
      ),
    ).toEqual([getErrorMessage(ERR_CODE.ER012)]);
  });
});

describe('employeeEditSchema', () => {
  const VALID_EDIT_FORM = {
    ...VALID_FORM,
    employeeLoginPassword: '',
    employeeLoginPasswordConfirm: '',
  };

  it('accepts form even when employeeLoginId is empty or undefined in edit mode', () => {
    const withoutLoginId = { ...VALID_EDIT_FORM, employeeLoginId: '' };
    expect(employeeEditSchema.safeParse(withoutLoginId).success).toBe(true);

    const undefinedLoginId = { ...VALID_EDIT_FORM, employeeLoginId: undefined };
    expect(employeeEditSchema.safeParse(undefinedLoginId).success).toBe(true);
  });

  it('does not perform regex or length checks on employeeLoginId in edit mode', () => {
    const invalidFormatLoginId = { ...VALID_EDIT_FORM, employeeLoginId: '123_invalid_login_starts_with_number!' };
    expect(employeeEditSchema.safeParse(invalidFormatLoginId).success).toBe(true);
  });

  it('accepts empty passwords in edit mode (keep existing password in DB)', () => {
    expect(employeeEditSchema.safeParse(VALID_EDIT_FORM).success).toBe(true);
  });
});
