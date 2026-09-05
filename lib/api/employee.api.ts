import { apiClient } from '@/lib/api/client';
import type {
  GetEmployeesParams,
  ListEmployeeResponse,
  CreateCertificationPayload,
  CreateEmployeePayload,
  EmployeeResponse,
} from '@/types/employee';
import type { validateEmployeeForm } from '@/lib/validation/validateEmployeeForm';

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
export function transformCreatePayload(form: validateEmployeeForm): CreateEmployeePayload {
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
export async function createEmployee(payload: CreateEmployeePayload): Promise<EmployeeResponse> {
  const response = await apiClient.post<EmployeeResponse>('/employee', payload);
  return response.data;
}
