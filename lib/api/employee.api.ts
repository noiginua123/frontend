import { apiClient } from '@/lib/api/client';
import type {
  GetEmployeesParams,
  ListEmployeeResponse,
  EmployeeMutationResponse,
} from '@/types/employee';
import type { EmployeeCreateFormData } from '@/lib/validation/employeeCreate';

/**
 * Thông tin một chứng chỉ gửi lên backend khi thêm mới nhân viên (tất cả là chuỗi).
 */
export interface CreateCertificationPayload {
  certificationId: string;
  startDate: string;
  endDate: string;
  score: string;
}

/**
 * Payload thêm mới nhân viên gửi lên backend (POST /employee, /employee/validate).
 */
export interface CreateEmployeePayload {
  employeeLoginId: string;
  employeeName: string;
  employeeNameKana: string;
  employeeBirthDate: string;
  employeeEmail: string;
  employeeTelephone: string;
  employeeLoginPassword: string;
  departmentId: string;
  certifications: CreateCertificationPayload[];
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

/**
 * Chuyển dữ liệu form phẳng (ADM004) thành payload backend: bỏ trường xác nhận mật
 * khẩu, gom chứng chỉ thành mảng (0 hoặc 1 phần tử).
 *
 * @param form Dữ liệu form đã qua validate
 * @return Payload để gửi lên backend
 */
export function transformCreatePayload(form: EmployeeCreateFormData): CreateEmployeePayload {
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
 * Gọi API kiểm tra dữ liệu trước khi sang màn xác nhận (không ghi DB).
 *
 * @param payload Dữ liệu nhân viên
 * @return Response chứa code thành công
 */
export async function validateEmployeeCreate(payload: CreateEmployeePayload): Promise<EmployeeMutationResponse> {
  const response = await apiClient.post<EmployeeMutationResponse>('/employee/validate', payload);
  return response.data;
}

/**
 * Gọi API thêm mới nhân viên (ghi DB).
 *
 * @param payload Dữ liệu nhân viên
 * @return Response chứa id và message thành công
 */
export async function createEmployee(payload: CreateEmployeePayload): Promise<EmployeeMutationResponse> {
  const response = await apiClient.post<EmployeeMutationResponse>('/employee', payload);
  return response.data;
}
