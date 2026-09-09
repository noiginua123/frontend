/**
 * Định nghĩa tập trung tất cả các đường dẫn điều hướng (routes) trong hệ thống ManageUser.
 */
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
  },
  SYSTEM_ERROR: '/systemError',
  EMPLOYEES: {
    LIST: '/employees/adm002',
    DETAIL: (id?: number | string) => (id ? `/employees/adm003?id=${id}` : '/employees/adm003'),
    INPUT: '/employees/adm004',
    EDIT: (id: number | string) => `/employees/adm004?id=${id}`,
    CONFIRM: '/employees/adm005',
    COMPLETE: '/employees/adm006',
  },
} as const;

/**
 * Đường dẫn điều hướng của màn hình chi tiết nhân viên ADM003 (tương thích ngược).
 */
export const ADM003_ROUTES = {
  detail: '/employees/adm003',
  list: ROUTES.EMPLOYEES.LIST,
  complete: ROUTES.EMPLOYEES.COMPLETE,
  edit: ROUTES.EMPLOYEES.EDIT,
} as const;

/**
 * Đường dẫn điều hướng của luồng thêm/sửa nhân viên ADM004 - ADM005 (tương thích ngược).
 */
export const ADM004_ROUTES = {
  input: ROUTES.EMPLOYEES.INPUT,
  confirm: ROUTES.EMPLOYEES.CONFIRM,
  complete: ROUTES.EMPLOYEES.COMPLETE,
  list: ROUTES.EMPLOYEES.LIST,
} as const;
