import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import { useADM003 } from '@/hooks/useADM003';
import { getEmployeeDetail, deleteEmployee } from '@/lib/api/employee.api';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockRouter = {
  replace: mockReplace,
  push: mockPush,
};
let mockSearchParams = new URLSearchParams('id=1');

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/lib/api/employee.api', () => ({
  getEmployeeDetail: jest.fn(),
  deleteEmployee: jest.fn(),
}));

describe('useADM003 hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams('id=1');
  });

  it('redirects to /systemError when employeeId is missing in searchParams', async () => {
    mockSearchParams = new URLSearchParams();

    renderHook(() => useADM003());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/systemError');
    });
  });

  it('redirects to /systemError when employeeId is not a valid number', async () => {
    mockSearchParams = new URLSearchParams('id=abc');

    renderHook(() => useADM003());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/systemError');
    });
  });

  it('redirects to /systemError when API returns error (e.g. employee not found or 500)', async () => {
    (getEmployeeDetail as jest.Mock).mockRejectedValueOnce(new Error('Not found'));

    renderHook(() => useADM003());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/systemError');
    });
  });

  it('sets employee data when API call is successful', async () => {
    const mockEmployee = {
      code: 200,
      employeeId: 1,
      employeeName: 'Nguyen Van A',
      certifications: [],
    };
    (getEmployeeDetail as jest.Mock).mockResolvedValue(mockEmployee);

    const { result } = renderHook(() => useADM003());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.employee).toEqual(mockEmployee);
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it('navigates to edit screen when handleEdit is called', async () => {
    (getEmployeeDetail as jest.Mock).mockResolvedValue({
      code: 200,
      employeeId: 1,
      employeeName: 'Nguyen Van A',
    });

    const { result } = renderHook(() => useADM003());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.handleEdit();
    expect(mockPush).toHaveBeenCalledWith('/employees/adm004?id=1');
  });

  it('navigates to list screen when handleBack is called', async () => {
    (getEmployeeDetail as jest.Mock).mockResolvedValue({
      code: 200,
      employeeId: 1,
      employeeName: 'Nguyen Van A',
    });

    const { result } = renderHook(() => useADM003());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    result.current.handleBack();
    expect(mockPush).toHaveBeenCalledWith('/employees/adm002');
  });

  describe('handleDelete', () => {
    const mockEmployee = {
      code: 200,
      employeeId: 1,
      employeeName: 'Nguyen Van A',
    };

    beforeEach(() => {
      (getEmployeeDetail as jest.Mock).mockResolvedValue(mockEmployee);
      window.sessionStorage.clear();
    });

    it('does not call deleteEmployee when user cancels confirmation', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

      const { result } = renderHook(() => useADM003());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(confirmSpy).toHaveBeenCalled();
      expect(deleteEmployee).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('successfully deletes employee, sets MSG003 in sessionStorage, and redirects to ADM006', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      (deleteEmployee as jest.Mock).mockResolvedValue({
        code: 200,
        employeeId: 1,
        message: { code: 'MSG003', params: [] },
      });

      const { result } = renderHook(() => useADM003());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(deleteEmployee).toHaveBeenCalledWith('1');
      expect(window.sessionStorage.getItem('adm006_success_message')).toBe('ユーザの削除が完了しました。');
      expect(mockPush).toHaveBeenCalledWith('/employees/adm006');
      confirmSpy.mockRestore();
    });

    it('handles ER020 error when trying to delete admin user', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      const error = {
        name: 'AxiosError',
        message: 'Request failed with status code 500',
        isAxiosError: true,
        response: {
          data: {
            code: 500,
            message: { code: 'ER020', params: [] },
          },
        },
      };
      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      (deleteEmployee as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useADM003());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(result.current.errorMessage).toBe('管理者ユーザを削除することはできません。');
      expect(result.current.employee).toEqual(mockEmployee);
      expect(result.current.isSystemError).toBe(false);
      expect(mockPush).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('handles ER014 error when user does not exist in DB', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      const error = {
        name: 'AxiosError',
        message: 'Request failed with status code 500',
        isAxiosError: true,
        response: {
          data: {
            code: 500,
            message: { code: 'ER014', params: [] },
          },
        },
      };
      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      (deleteEmployee as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useADM003());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(result.current.errorMessage).toBe('該当するユーザは存在していません。');
      expect(result.current.employee).toBeNull();
      expect(result.current.isSystemError).toBe(false);
      expect(mockPush).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('handles system error when API throws unexpected failure', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      (deleteEmployee as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useADM003());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(result.current.isSystemError).toBe(true);
      expect(result.current.errorMessage).toBe('システムエラーが発生しました。');
      expect(mockPush).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });
});
