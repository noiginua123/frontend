/**
 * Thông tin bảng phòng ban (Database / Domain model)
 */
export interface Department {
  department_id: number;
  department_name: string;
}

/**
 * Data Transfer Object cho phòng ban (API)
 */
export interface DepartmentDTO {
  departmentId: number;
  departmentName: string;
}

/**
 * Phản hồi API danh sách phòng ban GET /departments (hoặc /department)
 */
export interface ListDepartmentResponse {
  code: number;
  departments: DepartmentDTO[];
}
