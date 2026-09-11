import { renderHook, waitFor } from '@testing-library/react';
import { useADM005 } from '@/hooks/useADM005';
import { checkEmployeeExists, addEmployee, updateEmployee } from '@/lib/api/employee.api';
import { saveEmployeeFormData, clearEmployeeFormData } from '@/utils/storage';
import { DEFAULT_FORM_VALUES } from '@/hooks/useADM004';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockRouter = {
  replace: mockReplace,
  push: mockPush,
};

let mockSearchParams = new URLSearchParams('mode=edit&id=10');

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/lib/api/employee.api', () => ({
  checkEmployeeExists: jest.fn(),
  addEmployee: jest.fn(),
  updateEmployee: jest.fn(),
  transformCreatePayload: jest.fn((d) => d),
  transformUpdatePayload: jest.fn((d) => d),
}));

const VALID_STORED_FORM = {
  ...DEFAULT_FORM_VALUES,
  employeeLoginId: 'test_user',
  departmentId: '1',
  employeeName: 'Nguyễn Văn A',
  employeeNameKana: 'ｱｲｳ',
  employeeBirthDate: '1990/01/01',
  employeeEmail: 'test@example.com',
  employeeTelephone: '0123456789',
  mode: 'edit' as const,
  employeeId: '10',
};

describe('useADM005 hook - Employee verification on mount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearEmployeeFormData();
    window.sessionStorage.clear();
    mockSearchParams = new URLSearchParams('mode=edit&id=10');
  });

  it('in Edit mode: immediately calls checkEmployeeExists to check employee existence in DB', async () => {
    saveEmployeeFormData(VALID_STORED_FORM);

    (checkEmployeeExists as jest.Mock).mockResolvedValueOnce(true);

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(checkEmployeeExists).toHaveBeenCalledWith('10');
      expect(mockReplace).not.toHaveBeenCalled();
      expect(result.current.isCheckingDetail).toBe(false);
      expect(result.current.formData).toEqual(VALID_STORED_FORM);
    });
  });

  it('in Edit mode: redirects immediately to /systemError when employee does not exist in DB (returns false) without waiting for OK button', async () => {
    saveEmployeeFormData(VALID_STORED_FORM);

    (checkEmployeeExists as jest.Mock).mockResolvedValueOnce(false);

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(checkEmployeeExists).toHaveBeenCalledWith('10');
      expect(mockReplace).toHaveBeenCalledWith('/systemError');
      expect(result.current.formData).toBeNull();
    });
  });

  it('in Edit mode: redirects immediately to /systemError when checkEmployeeExists fails (network / 500) without waiting for OK button', async () => {
    saveEmployeeFormData(VALID_STORED_FORM);

    (checkEmployeeExists as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(checkEmployeeExists).toHaveBeenCalledWith('10');
      expect(mockReplace).toHaveBeenCalledWith('/systemError');
      expect(result.current.formData).toBeNull();
    });
  });

  it('in Add mode: does not call checkEmployeeExists', async () => {
    mockSearchParams = new URLSearchParams('mode=add');
    saveEmployeeFormData({
      ...VALID_STORED_FORM,
      employeeLoginId: 'new_user',
      employeeLoginPassword: 'password123',
      employeeLoginPasswordConfirm: 'password123',
      mode: 'add',
      employeeId: undefined,
    });

    const { result } = renderHook(() => useADM005());

    await waitFor(() => {
      expect(checkEmployeeExists).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
      expect(result.current.formData?.employeeLoginId).toBe('new_user');
    });
  });
});
