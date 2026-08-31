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

/**
 * Điều kiện lọc tìm kiếm nhân viên trên form ADM002
 */
export interface EmployeeSearchFilter {
  fullname: string;
  departmentId: string;
}

/**
 * Tham số truy vấn danh sách nhân viên qua API GET /employee
 */
export interface EmployeeSearchParams {
  name?: string;
  group?: string;
  page?: number;
  limit?: number;
}

/**
 * Cấu trúc bản ghi nhân viên trong cơ sở dữ liệu (Database Entity)
 */
export interface EmployeeDB {
  employee_id: number;
  department_id: number;
  employee_name: string;
  employee_name_kana?: string;
  employee_birth_date?: string;
  employee_email: string;
  employee_telephone?: string;
  employee_login_id: string;
  employee_login_password?: string;
  employee_role?: EmployeeRole;
}

/**
 * Model biểu diễn thông tin nhân viên hiển thị trên giao diện (UI display model)
 */
export interface Employee {
  id: string;
  name: string;
  nameKana?: string;
  dateOfBirth?: string;
  group?: string;
  email: string;
  phone?: string;
  japaneseProficiency?: string;
  expirationDate?: string;
  score?: number;
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
 * DTO dữ liệu phân trang danh sách nhân viên cho UI
 */
export interface EmployeeListResponse {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
 * Payload request thêm mới nhân viên POST /employee (ADM004 / ADM005)
 */
export interface EmployeeCreateRequest {
  employeeLoginId: string;
  employeeName: string;
  employeeNameKana: string;
  employeeBirthDate: string;
  employeeEmail: string;
  employeeTelephone: string;
  employeeLoginPassword?: string;
  departmentId: number;
  certifications?: EmployeeCertificationDTO[];
}

/**
 * Payload request cập nhật thông tin nhân viên PUT /employee (ADM004 / ADM005)
 */
export interface EmployeeUpdateRequest {
  employeeId: number;
  employeeLoginId: string;
  employeeName: string;
  employeeNameKana: string;
  employeeBirthDate: string;
  employeeEmail: string;
  employeeTelephone: string;
  employeeLoginPassword?: string;
  departmentId: number;
  certifications?: EmployeeCertificationDTO[];
}

/**
 * Response cho các thao tác thêm / sửa nhân viên
 */
export interface EmployeeMutationResponse {
  code: number;
  employeeId: number;
  message?: {
    code: string;
    params: string[];
  };
}

/**
 * Response cho thao tác xóa nhân viên DELETE /employee/{id}
 */
export interface EmployeeDeleteResponse {
  code: number;
  employeeId: number;
  message?: {
    code: string;
    params: string[];
  };
}
