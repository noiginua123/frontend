import {
  loadStoredADM002State,
  saveStoredADM002State,
  saveEmployeeFormData,
  loadEmployeeFormData,
  clearEmployeeFormData,
  ADM002SessionState,
  StoredEmployeeForm,
} from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storage';
import { SORT_ORDER } from '@/constants/sort';

describe('Storage Utils', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  describe('ADM002 Session State', () => {
    const mockState: ADM002SessionState = {
      currentPage: 3,
      searchParams: {
        fullname: 'Yamada',
        departmentId: '1',
      },
      sortConfig: {
        prioritySortField: 'employeeName',
        sortState: {
          ordEmployeeName: SORT_ORDER.DESC,
          ordCertificationName: SORT_ORDER.ASC,
          ordEndDate: SORT_ORDER.ASC,
        },
      },
    };

    it('should save and restore ADM002 session state properly, preserving currentPage', () => {
      saveStoredADM002State(mockState);
      const restored = loadStoredADM002State();
      expect(restored).not.toBeNull();
      expect(restored?.currentPage).toBe(3);
      expect(restored?.searchParams.fullname).toBe('Yamada');
      expect(restored?.searchParams.departmentId).toBe('1');
      expect(restored?.sortConfig.prioritySortField).toBe('employeeName');
      expect(restored?.sortConfig.sortState.ordEmployeeName).toBe(SORT_ORDER.DESC);
    });

    it('should return null if no stored ADM002 state exists', () => {
      expect(loadStoredADM002State()).toBeNull();
    });

    it('should fallback currentPage to 1 if stored currentPage is invalid or not positive', () => {
      window.sessionStorage.setItem(
        STORAGE_KEYS.ADM002_FILTER,
        JSON.stringify({ currentPage: 0, searchParams: {}, sortConfig: {} })
      );
      const restored = loadStoredADM002State();
      expect(restored?.currentPage).toBe(1);
    });
  });

  describe('ADM004 / ADM005 Employee Form Storage', () => {
    const mockFormData: StoredEmployeeForm = {
      employeeLoginId: 'yamada_taro',
      departmentId: '1',
      departmentName: '開発部',
      employeeName: '山田太郎',
      employeeNameKana: 'ﾔﾏﾀﾞﾀﾛｳ',
      employeeBirthDate: '1990/01/01',
      employeeEmail: 'yamada@example.com',
      employeeTelephone: '09012345678',
      employeeLoginPassword: 'Password123',
      employeeLoginPasswordConfirm: 'Password123',
      certificationId: '',
      certificationName: '',
      certificationStartDate: '',
      certificationEndDate: '',
      certificationScore: '',
    };

    it('should save and load valid employee form data', () => {
      saveEmployeeFormData(mockFormData);
      const loaded = loadEmployeeFormData();
      expect(loaded).not.toBeNull();
      expect(loaded?.employeeLoginId).toBe('yamada_taro');
      expect(loaded?.departmentName).toBe('開発部');
      expect(loaded?.certificationName).toBe('');
    });

    it('should clear employee form data from sessionStorage', () => {
      saveEmployeeFormData(mockFormData);
      expect(loadEmployeeFormData()).not.toBeNull();

      clearEmployeeFormData();
      expect(loadEmployeeFormData()).toBeNull();
    });

    it('should return null when no form data is in sessionStorage', () => {
      expect(loadEmployeeFormData()).toBeNull();
    });
  });
});
