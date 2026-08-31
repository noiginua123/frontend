import { ADM002_PAGE_SIZE } from '@/constants/adm002';
import type {
  EmployeeSearchFilter,
  EmployeeSortConfig,
  GetEmployeesParams,
} from '@/types/employee';

/**
 * Dựng query params cho API danh sách nhân viên từ filter, sort và trang hiện tại.
 * Các điều kiện tìm kiếm rỗng không được đưa vào request.
 *
 * @param filter Điều kiện tìm kiếm nhân viên
 * @param sortConfig Cấu hình sắp xếp
 * @param page Trang cần lấy dữ liệu
 * @return Query params tuân theo contract GET /employee
 */
export function buildEmployeeQueryParams(
  filter: EmployeeSearchFilter,
  sortConfig: EmployeeSortConfig,
  page: number,
): GetEmployeesParams {
  const params: GetEmployeesParams = {
    offset: (page - 1) * ADM002_PAGE_SIZE,
    limit: ADM002_PAGE_SIZE,
    priority_sort: sortConfig.prioritySortField,
    ord_employee_name: sortConfig.sortState.ordEmployeeName,
    ord_certification_name: sortConfig.sortState.ordCertificationName,
    ord_end_date: sortConfig.sortState.ordEndDate,
  };

  const normalizedFullname = filter.fullname.trim();
  if (normalizedFullname) {
    params.employee_name = normalizedFullname;
  }
  if (filter.departmentId) {
    params.department_id = filter.departmentId;
  }

  return params;
}
