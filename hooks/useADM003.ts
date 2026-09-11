'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

// --- Danh sách Import (Hằng số, API, Kiểu dữ liệu) ---
import { getEmployeeDetail, deleteEmployee } from '@/lib/api/employee.api';
import type { EmployeeDetailResponse } from '@/types/employee';
import type { BackendErrorBody } from '@/types';
import { ADM003_MESSAGES } from '@/constants/employee';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/storage';
import { ERR_CODE, getErrorMessage } from '@/constants/messages';

/**
 * Hook quản lý toàn bộ luồng nghiệp vụ của màn hình chi tiết nhân viên (ADM003).
 * Xử lý: Nạp thông tin chi tiết nhân viên theo ID, chuyển sang chỉnh sửa (ADM004) và thực hiện xóa nhân viên.
 *
 * @return Dữ liệu nhân viên, trạng thái tải và các hàm xử lý hành động
 */
export function useADM003() {
  /** Hook điều hướng trang */
  const router = useRouter();

  /** Hook đọc query string từ URL hiện tại */
  const searchParams = useSearchParams();

  // --- 1. Trạng thái và Cấu hình ---

  /** ID nhân viên lấy từ tham số URL */
  const employeeId = searchParams ? searchParams.get('id') : null;

  /** Thông tin chi tiết của nhân viên */
  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);

  /** Trạng thái đang nạp thông tin chi tiết nhân viên */
  const [loading, setLoading] = useState<boolean>(true);

  /** Trạng thái đang trong quá trình thực thi xóa nhân viên */
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  /** Thông báo lỗi nghiệp vụ hoặc lỗi hệ thống */
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /** Cờ xác định lỗi xảy ra có phải là lỗi hệ thống nghiêm trọng hay không */
  const [isSystemError, setIsSystemError] = useState<boolean>(false);

  // --- 2. Vòng đời và Khởi tạo dữ liệu ---

  /**
   * Tải thông tin chi tiết nhân viên từ máy chủ theo ID.
   *
   * @param id ID của nhân viên cần lấy thông tin chi tiết
   */
  const fetchEmployeeById = useCallback(async (id: string | number) => {
    setLoading(true);
    setErrorMessage(null);
    setIsSystemError(false);

    try {
      const data = await getEmployeeDetail(id);
      setEmployee(data);
    } catch {
      // Trường hợp ID lỗi (không tồn tại trong DB, lỗi máy chủ...), chuyển hướng sang trang lỗi hệ thống
      router.replace(ROUTES.SYSTEM_ERROR);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Tự động kiểm tra tính hợp lệ của ID và gọi nạp dữ liệu khi màn hình khởi tạo
  useEffect(() => {
    // Nếu ID thiếu, rỗng hoặc không phải số hợp lệ -> Chuyển hướng ngay sang màn hình lỗi hệ thống
    if (!employeeId || employeeId.trim() === '' || isNaN(Number(employeeId))) {
      router.replace(ROUTES.SYSTEM_ERROR);
      return;
    }

    void fetchEmployeeById(employeeId.trim());
  }, [employeeId, fetchEmployeeById, router]);

  // --- 3. Các hàm xử lý sự kiện ---

  /**
   * Chuyển hướng sang màn hình chỉnh sửa ADM004 kèm ID nhân viên.
   */
  const handleEdit = useCallback(() => {
    if (employeeId) {
      router.push(ROUTES.EMPLOYEES.EDIT(employeeId));
    }
  }, [employeeId, router]);

  /**
   * Xử lý xóa nhân viên:
   * 1. Hiển thị hộp thoại xác nhận xóa (MSG004).
   * 2. Gọi API xóa deleteEmployee(employeeId).
   * 3. Xử lý các mã lỗi nghiệp vụ ER014 / ER020 nếu có.
   * 4. Lưu thông báo thành công MSG003 và chuyển hướng sang màn hình hoàn tất ADM006.
   */
  const handleDelete = useCallback(async () => {
    if (!employeeId || isDeleting) {
      return;
    }

    // 1. Hiển thị hộp thoại xác nhận xóa (MSG004)
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
      // 2. Gọi API xóa nhân viên
      await deleteEmployee(employeeId.trim());

      // 3. Lưu thông báo thành công MSG003 vào sessionStorage và chuyển sang màn hình ADM006
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
        const body = err.response.data as BackendErrorBody;

        if (body.message?.code) {
          errorCode = body.message.code;
          const params = body.message.params ?? [];
          message = getErrorMessage(errorCode, params);

          // Nếu là lỗi nghiệp vụ hợp lệ từ máy chủ (ER014 hoặc ER020)
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

      // Xử lý các lỗi nghiệp vụ cụ thể:
      // - ER014: Nhân viên không tồn tại -> Xóa thông tin nhân viên để hiển thị hộp lỗi kèm nút Quay lại
      // - ER020: Không thể xóa tài khoản Quản trị viên -> Giữ thông tin và hiển thị thông báo lỗi
      if (errorCode === ERR_CODE.ER014) {
        setEmployee(null);
      }
      setErrorMessage(message);
    }
  }, [employeeId, isDeleting, router]);

  /**
   * Quay lại màn hình danh sách nhân viên ADM002.
   */
  const handleBack = useCallback(() => {
    router.push(ROUTES.EMPLOYEES.LIST);
  }, [router]);

  return {
    // Thông tin nhân viên & Trạng thái dữ liệu
    employee,
    loading,
    isDeleting,

    // Trạng thái lỗi
    errorMessage,
    isSystemError,

    // Các hàm xử lý hành động
    fetchEmployeeById,
    handleEdit,
    handleDelete,
    handleBack,
  };
}
