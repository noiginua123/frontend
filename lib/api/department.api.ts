import { apiClient } from '@/lib/api/client';
import { ListDepartmentResponse } from '@/types/employee';

/**
 * Lấy danh sách tất cả các phòng ban trong hệ thống.
 *
 * @return Danh sách phòng ban từ backend
 */
export async function getDepartments(): Promise<ListDepartmentResponse> {
  const response = await apiClient.get<ListDepartmentResponse>('/department');
  return response.data;
}
