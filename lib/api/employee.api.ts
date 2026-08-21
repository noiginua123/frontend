import { apiClient } from '@/lib/api/client';
import { ListDepartmentResponse, ListEmployeeResponse } from '@/types/employee';

export interface GetEmployeesParams {
  employee_name?: string;
  department_id?: string | number;
  ord_employee_name?: string;
  ord_certification_name?: string;
  ord_end_date?: string;
  offset?: number;
  limit?: number;
}

/**
 * Lấy danh sách các phòng ban.
 *
 * @return Danh sách phòng ban từ backend
 */
export async function getDepartments(): Promise<ListDepartmentResponse> {
  const response = await apiClient.get<ListDepartmentResponse>('/departments');
  return response.data;
}

/**
 * Tìm kiếm và lấy danh sách nhân viên theo tiêu chí.
 *
 * @param params Tham số tìm kiếm, sắp xếp và phân trang
 * @return Danh sách nhân viên và tổng số bản ghi
 */
export async function getEmployees(params?: GetEmployeesParams): Promise<ListEmployeeResponse> {
  const response = await apiClient.get<ListEmployeeResponse>('/employees', { params });
  return response.data;
}
