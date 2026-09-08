import { renderHook, waitFor } from '@testing-library/react';
import { useADM003 } from '@/hooks/useADM003';
import { getEmployeeDetail } from '@/lib/api/employee.api';

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
});
