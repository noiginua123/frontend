import { getEmployees } from '@/lib/api/employee.api';
import { apiClient } from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('employee.api', () => {
  it('should fetch employees with params successfully', async () => {
    const mockEmployees = {
      code: 200,
      totalRecords: 1,
      employees: [
        {
          employeeId: 1,
          employeeName: 'Nguyễn Văn A',
          employeeEmail: 'anv@luvina.net',
          role: 0 as const,
        },
      ],
    };

    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockEmployees });

    const params = { employee_name: 'Nguyễn', offset: 0, limit: 20 };
    const result = await getEmployees(params);
    expect(apiClient.get).toHaveBeenCalledWith('/employee', { params });
    expect(result).toEqual(mockEmployees);
  });
});
