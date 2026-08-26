import { apiClient } from '@/lib/api/client';
import { ListEmployeeResponse } from '@/types/employee';

export interface GetEmployeesParams {
  employee_name?: string;
  department_id?: string | number;
  ord_employee_name?: string;
  ord_certification_name?: string;
  ord_end_date?: string;
  priority_sort?: string;
  offset?: number;
  limit?: number;
}

/**
 * Tìm kiếm và lấy danh sách nhân viên theo tiêu chí.
 *
 * @param params Tham số tìm kiếm, sắp xếp và phân trang
 * @return Danh sách nhân viên và tổng số bản ghi
 */
export async function getEmployees(params?: GetEmployeesParams): Promise<ListEmployeeResponse> {
  const response = await apiClient.get<ListEmployeeResponse>('/employee', { params });
  return response.data;
}
