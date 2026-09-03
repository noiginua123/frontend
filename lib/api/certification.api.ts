import { apiClient } from '@/lib/api/client';
import { ListCertificationResponse } from '@/types/certification';

/**
 * Lấy danh sách tất cả chứng chỉ tiếng Nhật (dropdown 資格 của ADM004).
 *
 * @return Danh sách chứng chỉ từ backend
 */
export async function getCertifications(): Promise<ListCertificationResponse> {
  const response = await apiClient.get<ListCertificationResponse>('/certification');
  return response.data;
}
