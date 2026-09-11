'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

// --- Danh sách Import (Hằng số, API, Kiểu dữ liệu, Tiện ích) ---
import {
  addEmployee,
  updateEmployee,
  checkEmployeeExists,
  transformCreatePayload,
  transformUpdatePayload,
} from '@/lib/api/employee.api';
import {
  loadEmployeeFormData,
  clearEmployeeFormData,
  type StoredEmployeeForm,
} from '@/utils/storage';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/storage';
import { ERR_CODE, MSG_CODE, INFO_MESSAGES, getErrorMessage } from '@/constants/messages';
import type { BackendErrorBody } from '@/types';

/**
 * Hook quản lý toàn bộ luồng nghiệp vụ của màn hình xác nhận thông tin nhân viên (ADM005).
 * Xử lý: Kiểm tra tồn tại nhân viên trong cơ sở dữ liệu, gửi dữ liệu thêm mới / cập nhật và điều hướng sang ADM006.
 *
 * @return Dữ liệu biểu mẫu, các trạng thái và hàm xử lý sự kiện cho màn hình ADM005
 */
export function useADM005() {
  /** Hook điều hướng trang */
  const router = useRouter();

  /** Hook đọc query string từ URL hiện tại */
  const searchParams = useSearchParams();

  // --- 1. Trạng thái và Cấu hình ---

  /** Dữ liệu biểu mẫu đã nhập được nạp từ bộ nhớ phiên (sessionStorage) sau khi kiểm tra hợp lệ */
  const [formData, setFormData] = useState<StoredEmployeeForm | null>(null);

  /** Trạng thái đang gửi yêu cầu đăng ký / cập nhật lên máy chủ */
  const [submitting, setSubmitting] = useState<boolean>(false);

  /** Thông báo lỗi toàn cục trên màn hình */
  const [globalError, setGlobalError] = useState<string>('');

  /** Trạng thái đang kiểm tra sự tồn tại của nhân viên trong cơ sở dữ liệu (chế độ Chỉnh sửa) */
  const [isCheckingDetail, setIsCheckingDetail] = useState<boolean>(false);

  /** Tham số chế độ và ID từ URL */
  const urlMode = searchParams?.get('mode');
  const urlId = searchParams?.get('id');

  /** Chế độ và ID có hiệu lực (kết hợp URL và dữ liệu phiên) */
  const effectiveMode = urlMode || formData?.mode;
  const effectiveId = urlId || (formData?.employeeId ? String(formData.employeeId) : undefined);

  // --- 2. Vòng đời và Khởi tạo dữ liệu ---

  useEffect(() => {
    let isMounted = true;

    // Xác định chế độ và ID từ URL hoặc kiểm tra nhanh từ phiên
    const sessionData = loadEmployeeFormData();
    if (!sessionData) {
      // Nếu không có dữ liệu biểu mẫu từ ADM004 trong session -> Chuyển hướng ngay về ADM004
      router.replace(ROUTES.EMPLOYEES.INPUT);
      return;
    }

    const currentMode = urlMode || sessionData.mode;
    const currentId = urlId || (sessionData.employeeId ? String(sessionData.employeeId) : undefined);
    const isEditMode = currentMode === 'edit' || Boolean(currentId);

    // 1. Chế độ Chỉnh sửa: Kiểm tra tồn tại nhân viên trong DB trước khi nạp dữ liệu lên giao diện
    if (isEditMode) {
      if (!currentId || currentId.trim() === '' || isNaN(Number(currentId))) {
        router.replace(ROUTES.SYSTEM_ERROR);
        return;
      }

      const verifyAndLoadData = async () => {
        setIsCheckingDetail(true);
        try {
          // Bước 1 (Kiểm tra DB): Gọi API kiểm tra sự tồn tại của nhân viên
          const exists = await checkEmployeeExists(currentId);
          if (!isMounted) return;

          // Nếu nhân viên không tồn tại trong DB -> Chuyển hướng ngay sang màn hình lỗi hệ thống
          if (!exists) {
            router.replace(ROUTES.SYSTEM_ERROR);
            return;
          }

          // Bước 2 (getFormData từ ADM004): Lấy dữ liệu biểu mẫu đã nhập từ ADM004 trong bộ nhớ phiên
          const adm004FormData = loadEmployeeFormData();
          if (!adm004FormData) {
            router.replace(ROUTES.EMPLOYEES.INPUT);
            return;
          }

          // Bước 3 (setFormData lên State): Nạp dữ liệu vào state để React render thông tin lên màn hình ADM005
          setFormData(adm004FormData);
        } catch {
          if (isMounted) {
            // Lỗi gọi API hoặc lỗi kết nối -> Chuyển hướng sang màn hình lỗi hệ thống
            router.replace(ROUTES.SYSTEM_ERROR);
          }
        } finally {
          if (isMounted) {
            setIsCheckingDetail(false);
          }
        }
      };

      void verifyAndLoadData();
    } else {
      // 2. Chế độ Thêm mới: Không cần kiểm tra DB, lấy dữ liệu từ ADM004 và nạp lên state ngay
      setFormData(sessionData);
    }

    return () => {
      isMounted = false;
    };
  }, [urlMode, urlId, router]);

  // --- 3. Các hàm xử lý sự kiện ---

  /**
   * Xử lý xác nhận đăng ký / cập nhật nhân viên:
   * 1. Gửi dữ liệu lên máy chủ (POST cho thêm mới, PUT cho chỉnh sửa).
   * 2. Lưu thông báo thành công (MSG001 hoặc MSG002) vào sessionStorage.
   * 3. Chuyển hướng sang màn hình hoàn tất ADM006.
   * 4. Nếu xảy ra lỗi nghiệp vụ (như trùng tài khoản ER003), lưu lỗi và quay lại ADM004 để hiển thị.
   */
  const handleSubmit = async () => {
    if (!formData || submitting) {
      return;
    }
    setSubmitting(true);
    setGlobalError('');

    try {
      if (effectiveMode === 'edit' || effectiveId) {
        // Luồng Chỉnh sửa: gọi API cập nhật nhân viên
        const updatePayload = transformUpdatePayload({
          ...formData,
          employeeId: effectiveId || formData.employeeId,
        });
        await updateEmployee(updatePayload);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(
            STORAGE_KEYS.ADM006_SUCCESS_MESSAGE,
            INFO_MESSAGES[MSG_CODE.MSG002],
          );
        }
      } else {
        // Luồng Thêm mới: gọi API thêm mới nhân viên
        const createPayload = transformCreatePayload(formData);
        await addEmployee(createPayload);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(
            STORAGE_KEYS.ADM006_SUCCESS_MESSAGE,
            INFO_MESSAGES[MSG_CODE.MSG001],
          );
        }
      }

      clearEmployeeFormData();
      router.push(ROUTES.EMPLOYEES.COMPLETE);
    } catch (err) {
      let message = getErrorMessage(ERR_CODE.ER023);
      let isBusinessError = false;

      if (axios.isAxiosError(err) && err.response?.data) {
        const body = err.response.data as BackendErrorBody;
        if (body.message?.code) {
          const code = body.message.code;
          const params = body.message.params ?? [];
          message = getErrorMessage(code, params);

          // Nếu là lỗi nghiệp vụ từ máy chủ (khác mã ER023 lỗi hệ thống)
          if (code !== ERR_CODE.ER023) {
            isBusinessError = true;
          }
        }
      }

      if (isBusinessError) {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(STORAGE_KEYS.ADM004_ERROR, message);
        }
        router.push(getBackUrl());
        return;
      }

      setGlobalError(message);
      setSubmitting(false);
    }
  };

  // --- 4. Các hàm hỗ trợ nội bộ ---

  /**
   * Tạo đường dẫn quay lại ADM004 giữ nguyên chế độ và cờ back=1.
   */
  const getBackUrl = useCallback((): string => {
    if (effectiveMode === 'edit' || effectiveId) {
      return `${ROUTES.EMPLOYEES.INPUT}?mode=edit&back=1&id=${effectiveId}`;
    }
    return `${ROUTES.EMPLOYEES.INPUT}?mode=add&back=1`;
  }, [effectiveMode, effectiveId]);

  // --- 3. Các hàm xử lý sự kiện (tiếp tục) ---

  /**
   * Xử lý quay lại màn hình nhập liệu ADM004 kèm cờ back=1 để khôi phục dữ liệu đã nhập.
   */
  const handleBack = useCallback(() => {
    router.push(getBackUrl());
  }, [router, getBackUrl]);

  return {
    // Dữ liệu biểu mẫu & Trạng thái tải
    formData,
    submitting,
    globalError,
    isCheckingDetail,

    // Các hàm xử lý hành động
    handleSubmit,
    handleBack,
    handleOk: handleSubmit,
  };
}
