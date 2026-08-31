import { apiClient } from '@/lib/api/client';
import type {
  GetEmployeesParams,
  ListEmployeeResponse,
} from '@/types/employee';

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
