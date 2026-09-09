import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { addEmployee, transformCreatePayload } from '@/lib/api/employee.api';
import {
  loadEmployeeFormData,
  clearEmployeeFormData,
  type StoredEmployeeForm,
} from '@/utils/storage';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/storage';
import { ERR_CODE, MSG_CODE, INFO_MESSAGES, getErrorMessage } from '@/constants/messages';

interface BackendErrorBody {
  message?: {
    code?: string;
    params?: (string | number)[];
  };
}

/**
 * Hook điều khiển màn hình xác nhận ADM005: đọc dữ liệu đã nhập, gọi API thêm mới khi
 * bấm OK rồi điều hướng sang màn hoàn tất ADM006.
 *
 * @return Dữ liệu và các hàm xử lý cho màn hình ADM005
 */
export function useADM005() {
  const router = useRouter();
  const [formData] = useState<StoredEmployeeForm | null>(() => {
    return loadEmployeeFormData();
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>('');

  useEffect(() => {
    if (!formData) {
      router.replace(ROUTES.EMPLOYEES.INPUT);
    }
  }, [formData, router]);

  /**
   * Xử lý xác nhận đăng ký nhân viên: gửi dữ liệu lên backend,
   * lưu thông báo thành công và điều hướng sang màn hình ADM006.
   * Nếu gặp lỗi nghiệp vụ / validate (như trùng login ID ER003),
   * lưu thông báo lỗi và điều hướng quay lại ADM004 để hiển thị bảng lỗi đỏ bên trên.
   */
  const handleSubmit = async () => {
    if (!formData || submitting) {
      return;
    }
    setSubmitting(true);
    setGlobalError('');
    try {
      const payload = transformCreatePayload(formData);
      await addEmployee(payload);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(STORAGE_KEYS.ADM006_SUCCESS_MESSAGE, INFO_MESSAGES[MSG_CODE.MSG001]);
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

          // Nếu là lỗi nghiệp vụ từ backend (khác mã ER023 lỗi hệ thống bất ngờ)
          if (code !== ERR_CODE.ER023) {
            isBusinessError = true;
          }
        }
      }

      if (isBusinessError) {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(STORAGE_KEYS.ADM004_ERROR, message);
        }
        router.push(`${ROUTES.EMPLOYEES.INPUT}?mode=back`);
        return;
      }

      setGlobalError(message);
      setSubmitting(false);
    }
  };

  /**
   * Xử lý quay lại màn hình nhập liệu ADM004 kèm cờ mode=back để khôi phục dữ liệu đã nhập.
   */
  const handleBack = () => {
    router.push(`${ROUTES.EMPLOYEES.INPUT}?mode=back`);
  };

  return {
    formData,
    submitting,
    globalError,
    handleSubmit,
    handleBack,
  };
}
