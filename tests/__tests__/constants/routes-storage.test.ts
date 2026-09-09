import { ROUTES, ADM003_ROUTES, ADM004_ROUTES } from '@/constants/routes';
import {
  STORAGE_KEYS,
  ADM002_SESSION_KEY,
  ADM004_SESSION_KEY,
  ADM004_ERROR_KEY,
  ADM006_MESSAGE_KEY,
} from '@/constants/storage';
import {
  EMPLOYEE_PAGE_SIZE,
  ADM002_PAGE_SIZE,
  EMPLOYEE_NAME_MAX_LENGTH,
  EMPLOYEE_NAME_DISPLAY_LENGTH,
  DEFAULT_PRIORITY_SORT_FIELD,
  EMPLOYEE_SORT_FIELDS,
  ADM002_SORT_FIELDS,
  LABEL_TO_FIELD,
  CODE_TO_FIELD,
} from '@/constants/employee';

describe('Standardized Constants', () => {
  describe('ROUTES', () => {
    it('should define all application routes properly', () => {
      expect(ROUTES.AUTH.LOGIN).toBe('/login');
      expect(ROUTES.AUTH.LOGOUT).toBe('/logout');
      expect(ROUTES.SYSTEM_ERROR).toBe('/systemError');
      expect(ROUTES.EMPLOYEES.LIST).toBe('/employees/adm002');
      expect(ROUTES.EMPLOYEES.INPUT).toBe('/employees/adm004');
      expect(ROUTES.EMPLOYEES.CONFIRM).toBe('/employees/adm005');
      expect(ROUTES.EMPLOYEES.COMPLETE).toBe('/employees/adm006');
    });

    it('should correctly build dynamic route URLs', () => {
      expect(ROUTES.EMPLOYEES.DETAIL()).toBe('/employees/adm003');
      expect(ROUTES.EMPLOYEES.DETAIL(42)).toBe('/employees/adm003?id=42');
      expect(ROUTES.EMPLOYEES.EDIT(42)).toBe('/employees/adm004?id=42');
    });

    it('should maintain backward compatibility aliases for ADM003 and ADM004 routes', () => {
      expect(ADM003_ROUTES.list).toBe(ROUTES.EMPLOYEES.LIST);
      expect(ADM003_ROUTES.complete).toBe(ROUTES.EMPLOYEES.COMPLETE);
      expect(ADM003_ROUTES.edit(10)).toBe(ROUTES.EMPLOYEES.EDIT(10));
      expect(ADM003_ROUTES.detail).toBe('/employees/adm003');

      expect(ADM004_ROUTES.input).toBe(ROUTES.EMPLOYEES.INPUT);
      expect(ADM004_ROUTES.confirm).toBe(ROUTES.EMPLOYEES.CONFIRM);
      expect(ADM004_ROUTES.complete).toBe(ROUTES.EMPLOYEES.COMPLETE);
      expect(ADM004_ROUTES.list).toBe(ROUTES.EMPLOYEES.LIST);
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should define all storage keys centrally', () => {
      expect(STORAGE_KEYS.ACCESS_TOKEN).toBe('access_token');
      expect(STORAGE_KEYS.TOKEN_TYPE).toBe('token_type');
      expect(STORAGE_KEYS.ADM002_FILTER).toBe('adm002_filter_state');
      expect(STORAGE_KEYS.ADM004_FORM).toBe('adm004_employee_form');
      expect(STORAGE_KEYS.ADM004_ERROR).toBe('adm004_error_message');
      expect(STORAGE_KEYS.ADM006_SUCCESS_MESSAGE).toBe('adm006_success_message');
    });

    it('should maintain backward compatibility aliases for storage keys', () => {
      expect(ADM002_SESSION_KEY).toBe(STORAGE_KEYS.ADM002_FILTER);
      expect(ADM004_SESSION_KEY).toBe(STORAGE_KEYS.ADM004_FORM);
      expect(ADM004_ERROR_KEY).toBe(STORAGE_KEYS.ADM004_ERROR);
      expect(ADM006_MESSAGE_KEY).toBe(STORAGE_KEYS.ADM006_SUCCESS_MESSAGE);
    });
  });

  describe('EMPLOYEE constants', () => {
    it('should export pagination and sizing constants', () => {
      expect(EMPLOYEE_PAGE_SIZE).toBe(20);
      expect(ADM002_PAGE_SIZE).toBe(EMPLOYEE_PAGE_SIZE);
      expect(EMPLOYEE_NAME_MAX_LENGTH).toBe(125);
      expect(EMPLOYEE_NAME_DISPLAY_LENGTH).toBe(20);
      expect(DEFAULT_PRIORITY_SORT_FIELD).toBe('employeeName');
      expect(EMPLOYEE_SORT_FIELDS).toEqual(ADM002_SORT_FIELDS);
    });

    it('should define field mappings for form errors', () => {
      expect(LABEL_TO_FIELD['氏名']).toBe('employeeName');
      expect(CODE_TO_FIELD['ER019']).toBe('employeeLoginId');
    });
  });
});
