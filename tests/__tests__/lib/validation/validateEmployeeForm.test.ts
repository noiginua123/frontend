import { ERR_CODE, FIELD_LABELS, getErrorMessage } from '@/constants/messages';
import {
  employeeFormSchema,
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

  return result.error.issues
    .filter((issue) => issue.path[0] === field)
    .map((issue) => issue.message);
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
    const fiftyCodePoints = `a${'😀'.repeat(49)}`;

    expect(
      getFieldMessages({ employeeLoginId: fiftyCodePoints }, 'employeeLoginId'),
    ).toEqual([getErrorMessage(ERR_CODE.ER019)]);
    expect(
      getFieldMessages(
        { employeeName: '😀'.repeat(125) },
        'employeeName',
      ),
    ).toEqual([]);
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
