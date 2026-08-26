import { getDepartments } from '@/lib/api/department.api';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('department.api', () => {
  it('should fetch departments successfully', async () => {
    const mockDepartments = {
      code: 200,
      departments: [{ departmentId: 1, departmentName: 'DEV1' }],
    };

    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockDepartments });

    const result = await getDepartments();
    expect(apiClient.get).toHaveBeenCalledWith('/department');
    expect(result).toEqual(mockDepartments);
  });
});
