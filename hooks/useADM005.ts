import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { createEmployee, transformCreatePayload } from '@/lib/api/employee.api';
import {
  loadEmployeeFormData,
  clearEmployeeFormData,
  type StoredEmployeeForm,
} from '@/utils/employeeForm';
import { ADM004_ROUTES, ADM006_MESSAGE_KEY } from '@/constants/adm004';
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
      router.replace(ADM004_ROUTES.input);
    }
  }, [formData, router]);

  const onSubmit = async () => {
    if (!formData || submitting) {
      return;
    }
    setSubmitting(true);
    setGlobalError('');
    try {
      const payload = transformCreatePayload(formData);
      await createEmployee(payload);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(ADM006_MESSAGE_KEY, INFO_MESSAGES[MSG_CODE.MSG001]);
      }
      clearEmployeeFormData();
      router.push(ADM004_ROUTES.complete);
    } catch (err) {
      let message = getErrorMessage(ERR_CODE.ER023);
      if (axios.isAxiosError(err) && err.response?.data) {
        const body = err.response.data as BackendErrorBody;
        if (body.message?.code) {
          message = getErrorMessage(body.message.code, body.message.params ?? []);
        }
      }
      setGlobalError(message);
      setSubmitting(false);
    }
  };

  const onBack = () => {
    router.push(ADM004_ROUTES.input);
  };

  return {
    formData,
    submitting,
    globalError,
    onSubmit,
    onBack,
  };
}
