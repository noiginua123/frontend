import { apiClient } from '@/lib/api/client';
import type {
  GetEmployeesParams,
  ListEmployeeResponse,
  CreateCertificationPayload,
  CreateEmployeePayload,
  EmployeeResponse,
  EmployeeDetailResponse,
} from '@/types/employee';
import type { EmployeeFormData } from '@/lib/validation/validateEmployeeForm';

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

/**
 * Chuyển dữ liệu form phẳng (ADM004) thành payload backend: bỏ trường xác nhận mật
 * khẩu, gom chứng chỉ thành mảng (0 hoặc 1 phần tử).
 *
 * @param form Dữ liệu form đã qua validate
 * @return Payload để gửi lên backend
 */
export function transformCreatePayload(form: EmployeeFormData): CreateEmployeePayload {
  const hasCertification = form.certificationId != null && form.certificationId.trim() !== '';
  const certifications: CreateCertificationPayload[] = hasCertification
    ? [
      {
        certificationId: form.certificationId.trim(),
        startDate: form.certificationStartDate.trim(),
        endDate: form.certificationEndDate.trim(),
        score: form.certificationScore.trim(),
      },
    ]
    : [];

  return {
    employeeLoginId: form.employeeLoginId.trim(),
    employeeName: form.employeeName.trim(),
    employeeNameKana: form.employeeNameKana.trim(),
    employeeBirthDate: form.employeeBirthDate.trim(),
    employeeEmail: form.employeeEmail.trim(),
    employeeTelephone: form.employeeTelephone.trim(),
    employeeLoginPassword: form.employeeLoginPassword,
    departmentId: form.departmentId.trim(),
    certifications,
  };
}


/**
 * Gọi API thêm mới nhân viên (ghi DB).
 *
 * @param payload Dữ liệu nhân viên
 * @return Response chứa id và message thành công
 */
export async function addEmployee(payload: CreateEmployeePayload): Promise<EmployeeResponse> {
  const response = await apiClient.post<EmployeeResponse>('/employee', payload);
  return response.data;
}

/**
 * Lấy thông tin chi tiết nhân viên theo ID.
 *
 * @param employeeId ID của nhân viên cần lấy chi tiết
 * @return Thông tin chi tiết nhân viên kèm danh sách chứng chỉ
 */
export async function getEmployeeDetail(employeeId: number | string): Promise<EmployeeDetailResponse> {
  const response = await apiClient.get<EmployeeDetailResponse>(`/employee/${employeeId}`);
  return response.data;
}

/**
 * Xóa một nhân viên khỏi hệ thống theo ID.
 *
 * @param employeeId ID của nhân viên cần xóa
 * @return Response chứa ID và thông báo xóa thành công
 */
export async function deleteEmployee(employeeId: number | string): Promise<EmployeeResponse> {
  const response = await apiClient.delete<EmployeeResponse>(`/employee/${employeeId}`);
  return response.data;
}

