import { SORT_ORDER, SortOrder } from '@/constants/sort';
import { EmployeeSortConfig, SortField, SortState } from '@/types/employee';

/**
 * Trạng thái sắp xếp mặc định của 3 cột (đều bắt đầu bằng tăng dần).
 */
export const INITIAL_SORT_STATE: SortState = {
  ordEmployeeName: SORT_ORDER.ASC,
  ordCertificationName: SORT_ORDER.ASC,
  ordEndDate: SORT_ORDER.ASC,
};

/**
 * Cột ưu tiên sắp xếp mặc định khi vừa vào màn hình.
 */
export const INITIAL_PRIORITY_SORT_FIELD: SortField = 'employeeName';

/**
 * Cấu hình sắp xếp mặc định ban đầu.
 */
export const INITIAL_SORT_CONFIG: EmployeeSortConfig = {
  prioritySortField: INITIAL_PRIORITY_SORT_FIELD,
  sortState: INITIAL_SORT_STATE,
};

/**
 * Đảo chiều sắp xếp giữa tăng dần (ASC) và giảm dần (DESC).
 *
 * @param sortOrder Chiều sắp xếp hiện tại
 * @return Chiều sắp xếp đối nghịch tiếp theo
 */
export function toggleSortOrder(sortOrder: SortOrder): SortOrder {
  return sortOrder === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC;
}

/**
 * Tạo trạng thái sắp xếp mới khi click vào một cột:
 * Đảo chiều sắp xếp của cột được chọn, 2 cột còn lại giữ nguyên trạng thái.
 *
 * @param currentSortState Trạng thái sắp xếp hiện tại của 3 cột
 * @param field Cột được người dùng click chọn
 * @return Trạng thái sắp xếp mới sau khi đảo chiều cột được chọn
 */
export function createNextSortState(
  currentSortState: SortState,
  field: SortField,
): SortState {
  if (field === 'employeeName') {
    return {
      ...currentSortState,
      ordEmployeeName: toggleSortOrder(currentSortState.ordEmployeeName),
    };
  }
  if (field === 'certificationName') {
    return {
      ...currentSortState,
      ordCertificationName: toggleSortOrder(
        currentSortState.ordCertificationName,
      ),
    };
  }
  return {
    ...currentSortState,
    ordEndDate: toggleSortOrder(currentSortState.ordEndDate),
  };
}

/**
 * Tính cấu hình sắp xếp kế tiếp theo mô hình ưu tiên động:
 * 1. Cột vừa click trở thành cột ưu tiên chính (prioritySortField) và bị đảo chiều.
 * 2. Hai cột còn lại giữ nguyên chiều sắp xếp hiện tại trong sortState.
 *
 * @param previous Cấu hình sắp xếp trước đó
 * @param field Cột người dùng vừa click
 * @return Cấu hình sắp xếp mới hoàn chỉnh
 */
export function createNextSortConfig(
  previous: EmployeeSortConfig,
  field: SortField,
): EmployeeSortConfig {
  return {
    prioritySortField: field,
    sortState: createNextSortState(previous.sortState, field),
  };
}
