import { renderHook, waitFor, act } from '@testing-library/react';
import { useADM004, DEFAULT_FORM_VALUES } from '@/hooks/useADM004';
import { getDepartments } from '@/lib/api/department.api';
import { getCertifications } from '@/lib/api/certification.api';
import { getEmployeeDetail } from '@/lib/api/employee.api';
import {
  saveEmployeeFormData,
  clearEmployeeFormData,
} from '@/utils/storage';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockRouter = {
  replace: mockReplace,
  push: mockPush,
};

let mockSearchParams = new URLSearchParams('mode=add');

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/lib/api/department.api', () => ({
  getDepartments: jest.fn(),
}));

jest.mock('@/lib/api/certification.api', () => ({
  getCertifications: jest.fn(),
}));

jest.mock('@/lib/api/employee.api', () => ({
  getEmployeeDetail: jest.fn(),
}));

describe('useADM004 hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearEmployeeFormData();
    window.sessionStorage.clear();
    mockSearchParams = new URLSearchParams('mode=add');

    (getDepartments as jest.Mock).mockResolvedValue({
      departments: [
        { departmentId: 1, departmentName: 'Phòng Phát Triển' },
      ],
    });

    (getCertifications as jest.Mock).mockResolvedValue({
      certifications: [
        { certificationId: 1, certificationName: 'N1' },
      ],
    });
  });

  describe('Add Mode (mode=add)', () => {
    it('initializes form with DEFAULT_FORM_VALUES and isEdit=false', async () => {
      mockSearchParams = new URLSearchParams('mode=add');

      const { result } = renderHook(() => useADM004());

      await waitFor(() => {
        expect(result.current.isEdit).toBe(false);
        expect(result.current.mode).toBe('add');
        expect(result.current.form.getValues('employeeLoginId')).toBe('');
        expect(result.current.departments.length).toBe(1);
      });
    });

    it('navigates to list screen when handleBack is called in add mode', async () => {
      mockSearchParams = new URLSearchParams('mode=add');

      const { result } = renderHook(() => useADM004());

      await waitFor(() => {
        expect(result.current.departments.length).toBe(1);
      });

      act(() => {
        result.current.handleBack();
      });

      expect(mockPush).toHaveBeenCalledWith('/employees/adm002');
    });
  });

  describe('Edit Mode (mode=edit)', () => {
    it('fetches employee detail and fills form when employee and loginId exist', async () => {
      mockSearchParams = new URLSearchParams('mode=edit&id=10');

      const mockEmployee = {
        code: 200,
        employeeId: 10,
        employeeLoginId: 'test_user',
        employeeName: 'Nguyễn Văn A',
        employeeNameKana: 'ｱｲｳｴｵ',
        employeeBirthDate: '1995/05/10',
        employeeEmail: 'test@example.com',
        employeeTelephone: '0123456789',
        departmentId: 1,
        departmentName: 'Phòng Phát Triển',
        certifications: [
          {
            certificationId: 1,
            certificationName: 'N1',
            startDate: '2020/01/01',
            endDate: '2025/01/01',
            score: 150,
          },
        ],
      };

      (getEmployeeDetail as jest.Mock).mockResolvedValueOnce(mockEmployee);

      const { result } = renderHook(() => useADM004());

      await waitFor(() => {
        expect(result.current.isEdit).toBe(true);
        expect(result.current.mode).toBe('edit');
        expect(result.current.form.getValues('employeeLoginId')).toBe('test_user');
        expect(result.current.form.getValues('employeeName')).toBe('Nguyễn Văn A');
        expect(result.current.form.getValues('employeeLoginPassword')).toBe(''); // Password rỗng khi sửa
        expect(result.current.departments.length).toBe(1);
      });

      expect(getEmployeeDetail).toHaveBeenCalledWith('10');
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('redirects to /systemError when id is invalid or missing in edit mode', async () => {
      mockSearchParams = new URLSearchParams('mode=edit&id=invalid');

      renderHook(() => useADM004());

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/systemError');
      });
      expect(getEmployeeDetail).not.toHaveBeenCalled();
    });

    it('delegates DB existence verification to ADM005 without blocking form initialization in ADM004', async () => {
      mockSearchParams = new URLSearchParams('mode=edit&id=10');

      (getEmployeeDetail as jest.Mock).mockResolvedValueOnce({
        code: 200,
        employeeId: 10,
        employeeLoginId: 'user10',
      });

      const { result } = renderHook(() => useADM004());

      await waitFor(() => {
        expect(result.current.isEdit).toBe(true);
        expect(mockReplace).not.toHaveBeenCalled();
      });
    });

    it('navigates to detail screen when handleBack is called in edit mode', async () => {
      mockSearchParams = new URLSearchParams('mode=edit&id=10');

      (getEmployeeDetail as jest.Mock).mockResolvedValueOnce({
        code: 200,
        employeeId: 10,
        employeeLoginId: 'user10',
      });

      const { result } = renderHook(() => useADM004());

      await waitFor(() => {
        expect(result.current.isEdit).toBe(true);
        expect(result.current.departments.length).toBe(1);
      });

      act(() => {
        result.current.handleBack();
      });

      expect(mockPush).toHaveBeenCalledWith('/employees/adm003?id=10');
    });
  });

  describe('Back Mode (back=1)', () => {
    it('restores form data from sessionStorage in Edit mode without calling DB', async () => {
      mockSearchParams = new URLSearchParams('mode=edit&back=1&id=10');

      saveEmployeeFormData({
        ...DEFAULT_FORM_VALUES,
        employeeLoginId: 'edited_login_id',
        employeeName: 'Tên Đã Sửa',
        departmentId: '1',
        employeeEmail: 'edited@example.com',
        employeeTelephone: '0987654321',
        employeeBirthDate: '1990/01/01',
        employeeNameKana: 'ｱｲｳ',
        mode: 'edit',
        employeeId: '10',
      });

      const { result } = renderHook(() => useADM004());

      await waitFor(() => {
        expect(result.current.isEdit).toBe(true);
        expect(result.current.form.getValues('employeeLoginId')).toBe('edited_login_id');
        expect(result.current.form.getValues('employeeName')).toBe('Tên Đã Sửa');
        expect(result.current.departments.length).toBe(1);
      });

      // Tuyệt đối không gọi lại DB API
      expect(getEmployeeDetail).not.toHaveBeenCalled();
    });

    it('restores form data from sessionStorage in Add mode without calling DB', async () => {
      mockSearchParams = new URLSearchParams('mode=add&back=1');

      saveEmployeeFormData({
        ...DEFAULT_FORM_VALUES,
        employeeLoginId: 'new_login_id',
        employeeName: 'Tên Thêm Mới',
        departmentId: '1',
        employeeEmail: 'new@example.com',
        employeeTelephone: '0987654321',
        employeeBirthDate: '1990/01/01',
        employeeNameKana: 'ｱｲｳ',
        employeeLoginPassword: 'password123',
        employeeLoginPasswordConfirm: 'password123',
        mode: 'add',
      });

      const { result } = renderHook(() => useADM004());

      await waitFor(() => {
        expect(result.current.isEdit).toBe(false);
        expect(result.current.form.getValues('employeeLoginId')).toBe('new_login_id');
        expect(result.current.form.getValues('employeeName')).toBe('Tên Thêm Mới');
        expect(result.current.departments.length).toBe(1);
      });

      expect(getEmployeeDetail).not.toHaveBeenCalled();
    });
  });
});
