'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { EMPLOYEE_NAME_MAX_LENGTH } from '@/constants/adm002';
import {
  EmployeeSearchFormData,
  employeeSearchSchema,
} from '@/lib/validation/employee';
import { DepartmentDTO, EmployeeSearchFilter } from '@/types/employee';

interface EmployeeListFormProps {
  departments: DepartmentDTO[];
  departmentError: string | null;
  onSearch: (filter: EmployeeSearchFilter) => void;
  initialFullname?: string;
  initialDepartmentId?: string;
}

/**
 * Hiển thị form nhập điều kiện tìm kiếm nhân viên và nút thêm mới.
 *
 * @param departments Danh sách phòng ban dùng cho combobox
 * @param departmentError Thông báo lỗi khi không lấy được phòng ban
 * @param onSearch Hàm xử lý khi người dùng thực hiện tìm kiếm
 * @param initialFullname Tên nhân viên được khởi tạo trên form
 * @param initialDepartmentId ID phòng ban được khởi tạo trên form
 * @return Form tìm kiếm nhân viên ADM002
 */
export const EmployeeListForm: React.FC<EmployeeListFormProps> = ({
  departments,
  departmentError,
  onSearch,
  initialFullname = '',
  initialDepartmentId = '',
}) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<EmployeeSearchFormData>({
    resolver: zodResolver(employeeSearchSchema),
    defaultValues: {
      fullname: initialFullname,
      departmentId: initialDepartmentId,
    },
  });

  // Tự động focus vào ô nhập tìm kiếm tên khi vừa vào màn hình
  React.useEffect(() => {
    setFocus('fullname');
  }, [setFocus]);

  // Đồng bộ giá trị input form khi initialFullname hoặc initialDepartmentId được khôi phục từ sessionStorage
  React.useEffect(() => {
    reset({
      fullname: initialFullname,
      departmentId: initialDepartmentId,
    });
  }, [initialFullname, initialDepartmentId, reset]);

  /**
   * Chuyển dữ liệu form đã được kiểm tra hợp lệ sang hàm tìm kiếm.
   *
   * @param formData Điều kiện tìm kiếm lấy từ form
   */
  const handleSearch = (formData: EmployeeSearchFormData) => {
    onSearch(formData);
  };

  /**
   * Chuyển sang màn hình đăng ký nhân viên ADM004.
   */
  const handleAddEmployee = () => {
    router.push('/employees/adm004');
  };

  return (
    <div className="search-memb">
      <h1 className="title">会員名称で会員を検索します。検索条件無しの場合は全て表示されます。</h1>
      {departmentError && (
        <div className="box-err-content adm002-error-message">
          {departmentError}
        </div>
      )}
      <form className="c-form" onSubmit={handleSubmit(handleSearch)}>
        <ul className="d-flex">
          <li className="form-group row">
            <label className="col-form-label">氏名:</label>
            <div className="col-sm">
              <input
                type="text"
                autoFocus
                maxLength={EMPLOYEE_NAME_MAX_LENGTH}
                aria-invalid={Boolean(errors.fullname)}
                {...register('fullname')}
              />
              {errors.fullname && (
                <div className="box-err-content adm002-field-error">
                  {errors.fullname.message}
                </div>
              )}
            </div>
          </li>
          <li className="form-group row">
            <label className="col-form-label">グループ:</label>
            <div className="col-sm">
              <select
                {...register('departmentId')}
              >
                <option value="">全て</option>
                {departments.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
          </li>
          <li className="form-group row">
            <div className="btn-group">
              <button type="submit" className="btn btn-primary btn-sm">
                検索
              </button>
              <button
                type="button"
                onClick={handleAddEmployee}
                className="btn btn-secondary btn-sm"
              >
                新規追加
              </button>
            </div>
          </li>
        </ul>
      </form>
    </div>
  );
};
