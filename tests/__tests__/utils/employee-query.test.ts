import { SORT_ORDER } from '@/constants/sort';
import { buildEmployeeQueryParams } from '@/utils/employee-query';

const sortConfig = {
  prioritySortField: 'employeeName' as const,
  sortState: {
    ordEmployeeName: SORT_ORDER.ASC,
    ordCertificationName: SORT_ORDER.DESC,
    ordEndDate: SORT_ORDER.ASC,
  },
};

describe('buildEmployeeQueryParams', () => {
  it('builds paging, sort and normalized filters', () => {
    expect(
      buildEmployeeQueryParams(
        { fullname: '  Nguyen Van A  ', departmentId: '3' },
        sortConfig,
        2,
      ),
    ).toEqual({
      employee_name: 'Nguyen Van A',
      department_id: '3',
      ord_employee_name: SORT_ORDER.ASC,
      ord_certification_name: SORT_ORDER.DESC,
      ord_end_date: SORT_ORDER.ASC,
      priority_sort: 'employeeName',
      offset: 20,
      limit: 20,
    });
  });

  it('omits empty search filters', () => {
    expect(
      buildEmployeeQueryParams(
        { fullname: '   ', departmentId: '' },
        sortConfig,
        1,
      ),
    ).toEqual({
      ord_employee_name: SORT_ORDER.ASC,
      ord_certification_name: SORT_ORDER.DESC,
      ord_end_date: SORT_ORDER.ASC,
      priority_sort: 'employeeName',
      offset: 0,
      limit: 20,
    });
  });
});
