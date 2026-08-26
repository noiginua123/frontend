/**
 * Thông tin bảng trình độ chứng chỉ tiếng Nhật (Database / Domain model)
 */
export interface Certification {
  certification_id: number;
  certification_name: string;
  certification_level: number;
}

/**
 * Thông tin bảng quan hệ nhân viên và chứng chỉ (Database / Domain model)
 */
export interface EmployeeCertification {
  employee_certification_id: number;
  employee_id: number;
  certification_id: number;
  start_date: string; // Định dạng yyyy/MM/dd
  end_date: string;   // Định dạng yyyy/MM/dd
  score: number;
}

/**
 * Data Transfer Object cho chứng chỉ tiếng Nhật (API GET /certifications)
 */
export interface CertificationDTO {
  certificationId: number;
  certificationName: string;
  certificationLevel: number;
}

/**
 * Data Transfer Object cho chứng chỉ gắn với nhân viên trong Chi tiết / Thêm mới / Chỉnh sửa
 */
export interface EmployeeCertificationDTO {
  certificationId: number;
  certificationName?: string;
  startDate: string; // Định dạng yyyy/MM/dd
  endDate: string;   // Định dạng yyyy/MM/dd
  score: number;
}

/**
 * Phản hồi API danh sách chứng chỉ GET /certifications (hoặc /certification)
 */
export interface ListCertificationResponse {
  code: number;
  certifications: CertificationDTO[];
}
