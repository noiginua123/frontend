import { ERR_CODE, FIELD_LABELS, getErrorMessage } from '@/constants/messages';
import { ADM002_MESSAGES, EMPLOYEE_NAME_MAX_LENGTH } from '@/constants/adm002';
import {
  employeeSearchSchema,
  sanitizeEmployeeNameInput,
} from '@/lib/validation/employee';

describe('employeeSearchSchema (ADM002)', () => {
  it('accepts an empty search condition (to display all employees)', () => {
    const result = employeeSearchSchema.safeParse({
      fullname: '',
      departmentId: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a fullname that contains only whitespace with ER001', () => {
    const result = employeeSearchSchema.safeParse({
      fullname: '   ',
      departmentId: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        getErrorMessage(ERR_CODE.ER001, [FIELD_LABELS.FULLNAME]),
      );
    }
  });

  it('rejects a fullname exceeding 125 characters with ER006', () => {
    const longName = 'a'.repeat(EMPLOYEE_NAME_MAX_LENGTH + 1);
    const result = employeeSearchSchema.safeParse({
      fullname: longName,
      departmentId: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        ADM002_MESSAGES.fullnameMaxLength,
      );
    }
  });

  it('accepts a valid fullname and departmentId', () => {
    const result = employeeSearchSchema.safeParse({
      fullname: 'Nguyen Van A',
      departmentId: '1',
    });
    expect(result.success).toBe(true);
  });
});

describe('sanitizeEmployeeNameInput', () => {
  it('strips leading whitespace and compresses multiple consecutive spaces', () => {
    expect(sanitizeEmployeeNameInput('   Nguyen    Van    A   ')).toBe(
      'Nguyen Van A ',
    );
  });
});
