import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

import { getEmployeeDetail, deleteEmployee } from '@/lib/api/employee.api';
import type { EmployeeDetailResponse } from '@/types/employee';
import { ADM003_MESSAGES } from '@/constants/employee';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/storage';
import { ERR_CODE, getErrorMessage } from '@/constants/messages';

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
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
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
      router.replace(ROUTES.SYSTEM_ERROR);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Tự động kiểm tra và gọi fetchEmployeeById khi component mount
  useEffect(() => {
    // Nếu ID thiếu, rỗng hoặc không phải số hợp lệ -> redirect ngay sang /systemError
    if (!employeeId || employeeId.trim() === '' || isNaN(Number(employeeId))) {
      router.replace(ROUTES.SYSTEM_ERROR);
      return;
    }

    void fetchEmployeeById(employeeId.trim());
  }, [employeeId, fetchEmployeeById, router]);

  /**
   * Điều hướng sang màn hình chỉnh sửa ADM004 kèm ID.
   */
  const handleEdit = useCallback(() => {
    if (employeeId) {
      router.push(ROUTES.EMPLOYEES.EDIT(employeeId));
    }
  }, [employeeId, router]);

  /**
   * Xử lý xóa nhân viên.
   * Hiển thị dialog xác nhận xóa (MSG004),
   * gọi API deleteEmployee(employeeId), xử lý mã lỗi ER014 / ER020,
   * và điều hướng về màn hình danh sách ADM002 kèm thông báo thành công MSG003.
   */
  const handleDelete = useCallback(async () => {
    if (!employeeId || isDeleting) {
      return;
    }

    // 1. Hiển thị dialog xác nhận: 削除しますが、よろしいでしょうか。 (MSG004)
    const confirmed = typeof window !== 'undefined'
      ? window.confirm(ADM003_MESSAGES.confirmDelete)
      : true;

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);
    setIsSystemError(false);

    try {
      // 2. Gọi API deleteEmployee(employeeId)
      await deleteEmployee(employeeId.trim());

      // 3. Lưu thông báo MSG003 vào sessionStorage và điều hướng sang màn hoàn tất ADM006
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          STORAGE_KEYS.ADM006_SUCCESS_MESSAGE,
          ADM003_MESSAGES.deleteSuccess
        );
      }
      router.push(ROUTES.EMPLOYEES.COMPLETE);
    } catch (err: unknown) {
      setIsDeleting(false);

      let message = getErrorMessage(ERR_CODE.ER023);
      let isSystemErr = true;
      let errorCode: string | undefined;

      if (axios.isAxiosError(err) && err.response?.data) {
        const body = err.response.data as {
          message?: {
            code?: string;
            params?: (string | number)[];
          };
        };

        if (body.message?.code) {
          errorCode = body.message.code;
          const params = body.message.params ?? [];
          message = getErrorMessage(errorCode, params);

          // Nếu là lỗi nghiệp vụ hợp lệ từ backend (ER014 hoặc ER020)
          if (errorCode === ERR_CODE.ER014 || errorCode === ERR_CODE.ER020) {
            isSystemErr = false;
          }
        }
      }

      if (isSystemErr) {
        setIsSystemError(true);
        setErrorMessage(message);
        return;
      }

      // Xử lý lỗi nghiệp vụ:
      // - ER014: Nhân viên không tồn tại -> clear employee để hiển thị box-err kèm nút 戻る
      // - ER020: Cố xóa tài khoản Admin -> giữ nguyên employee và hiển thị box-err phía trên
      if (errorCode === ERR_CODE.ER014) {
        setEmployee(null);
      }
      setErrorMessage(message);
    }
  }, [employeeId, isDeleting, router]);

  /**
   * Quay lại màn hình danh sách ADM002.
   */
  const handleBack = useCallback(() => {
    router.push(ROUTES.EMPLOYEES.LIST);
  }, [router]);

  return {
    employee,
    loading,
    isDeleting,
    errorMessage,
    isSystemError,
    fetchEmployeeById,
    handleEdit,
    handleDelete,
    handleBack,
  };
}

