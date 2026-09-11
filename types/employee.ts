import { EmployeeCertificationDTO } from './certification';
import { SortOrder } from '@/constants/sort';

/**
 * Vai trò của nhân viên trong hệ thống (0: Quản trị viên, 1: Nhân viên)
 */
export type EmployeeRole = 0 | 1;

/**
 * Các cột có thể sắp xếp trên danh sách nhân viên
 */
export type SortField = 'employeeName' | 'certificationName' | 'endDate';

/**
 * Trạng thái chiều sắp xếp hiện tại của các cột
 */
export interface SortState {
  ordEmployeeName: SortOrder;
  ordCertificationName: SortOrder;
  ordEndDate: SortOrder;
}

/** Cấu hình cột sort ưu tiên và chiều sort của từng cột. */
export interface EmployeeSortConfig {
  prioritySortField: SortField;
  sortState: SortState;
}

/**
 * Điều kiện lọc tìm kiếm nhân viên trên form ADM002
 */
export interface EmployeeSearchFilter {
  fullname: string;
  departmentId: string;
}

/**
 * Tham số truy vấn danh sách nhân viên qua API GET /employee.
 */
export interface GetEmployeesParams {
  employee_name?: string;
  department_id?: string | number;
  ord_employee_name?: SortOrder;
  ord_certification_name?: SortOrder;
  ord_end_date?: SortOrder;
  priority_sort?: SortField;
  offset?: number;
  limit?: number;
}

/**
 * DTO đại diện cho một bản ghi nhân viên trong danh sách trả về từ backend (API GET /employee)
 */
export interface EmployeeListDTO {
  employeeId: number;
  employeeName: string;
  employeeBirthDate?: string;
  departmentName?: string;
  employeeEmail: string;
  employeeTelephone?: string;
  certificationName?: string;
  endDate?: string;
  score?: number | null;
  role?: EmployeeRole;
}

/**
 * Alias cho phần tử trong bảng danh sách nhân viên
 */
export type EmployeeListItem = EmployeeListDTO;

/**
 * Cấu trúc response trả về từ API lấy danh sách nhân viên GET /employee
 */
export interface ListEmployeeResponse {
  code: number;
  totalRecords: number;
  employees: EmployeeListDTO[];
}

/**
 * DTO thông tin chi tiết nhân viên từ API GET /employee/{id} (ADM003 / ADM004)
 */
export interface EmployeeDetailResponse {
  code: number;
  employeeId: number;
  employeeName: string;
  employeeBirthDate: string;
  departmentId: number;
  departmentName: string;
  employeeEmail: string;
  employeeTelephone: string;
  employeeNameKana: string;
  employeeLoginId: string;
  certifications: EmployeeCertificationDTO[];
}

/**
 * Thông tin một chứng chỉ gửi lên backend khi thêm mới / cập nhật nhân viên (khớp CertificationRequest.java)
 */
export interface CreateCertificationPayload {
  certificationId: string;
  startDate: string;
  endDate: string;
  score: string;
}

/**
 * Payload thêm mới nhân viên gửi lên backend (khớp EmployeeRequest.java)
 */
export interface CreateEmployeePayload {
  employeeLoginId: string;
  employeeName: string;
  employeeNameKana: string;
  employeeBirthDate: string;
  employeeEmail: string;
  employeeTelephone: string;
  employeeLoginPassword?: string;
  departmentId: string;
  certifications: CreateCertificationPayload[];
}

/**
 * Payload cập nhật thông tin nhân viên PUT /employee/{id}
 */
export interface UpdateEmployeePayload extends CreateEmployeePayload {
  employeeId: number | string;
}

/**
 * Response cho các thao tác thêm / sửa / xóa nhân viên (khớp với EmployeeResponse.java backend)
 */
export interface EmployeeResponse {
  code: number;
  employeeId: number;
  message?: {
    code: string;
    params: string[];
  };
}
