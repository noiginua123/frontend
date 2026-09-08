import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { getEmployeeDetail } from '@/lib/api/employee.api';
import type { EmployeeDetailResponse } from '@/types/employee';
import { ADM003_ROUTES } from '@/constants/adm003';

/**
 * Custom Hook quản lý dữ liệu và nghiệp vụ cho màn hình chi tiết nhân viên ADM003.
 *
 * @return Dữ liệu nhân viên, trạng thái tải và các hàm xử lý hành động
 */
export function useADM003() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams ? searchParams.get('id') : null;

  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSystemError, setIsSystemError] = useState<boolean>(false);

  /**
   * Tải thông tin chi tiết nhân viên từ backend theo ID.
   *
   * @param id ID của nhân viên cần lấy chi tiết
   */
  const fetchEmployeeById = useCallback(async (id: string | number) => {
    setLoading(true);
    setErrorMessage(null);
    setIsSystemError(false);

    try {
      const data = await getEmployeeDetail(id);
      setEmployee(data);
    } catch {
      // Khi trường hợp ID lỗi (không tồn tại trong DB, lỗi hệ thống...), redirect sang màn /systemError
      router.replace('/systemError');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Tự động kiểm tra và gọi fetchEmployeeById khi component mount
  useEffect(() => {
    // Nếu ID thiếu, rỗng hoặc không phải số hợp lệ -> redirect ngay sang /systemError
    if (!employeeId || employeeId.trim() === '' || isNaN(Number(employeeId))) {
      router.replace('/systemError');
      return;
    }

    void fetchEmployeeById(employeeId.trim());
  }, [employeeId, fetchEmployeeById, router]);

  /**
   * Điều hướng sang màn hình chỉnh sửa ADM004 kèm ID.
   */
  const handleEdit = useCallback(() => {
    if (employeeId) {
      router.push(ADM003_ROUTES.edit(employeeId));
    }
  }, [employeeId, router]);

  /**
   * Xử lý xóa nhân viên.
   * TODO: Hiển thị dialog xác nhận xóa (MSG004),
   * gọi API deleteEmployee(employeeId), xử lý mã lỗi ER014 / ER020,
   * và điều hướng về màn hình danh sách ADM002 kèm thông báo thành công MSG003.
   */
  const handleDelete = useCallback(async () => {
    // TODO: Hiển thị xác nhận: 削除しますが、よろしいでしょうか。 (MSG004 / ADM003_MESSAGES.confirmDelete)
    // TODO: Gọi API deleteEmployee(employeeId) từ @/lib/api/employee.api
    // TODO: Xử lý ngoại lệ (ER014: nhân viên không tồn tại, ER020: không thể xóa tài khoản admin)
    // TODO: Điều hướng về màn hình danh sách ADM002 và hiển thị thông báo MSG003 (ユーザの削除が完了しました。)
    console.log('TODO: Implement handleDelete for employeeId:', employeeId);
  }, [employeeId]);

  /**
   * Quay lại màn hình danh sách ADM002.
   */
  const handleBack = useCallback(() => {
    router.push(ADM003_ROUTES.list);
  }, [router]);

  return {
    employee,
    loading,
    errorMessage,
    isSystemError,
    fetchEmployeeById,
    handleEdit,
    handleDelete,
    handleBack,
  };
}
