import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { getDepartments } from '@/lib/api/department.api';
import { getCertifications } from '@/lib/api/certification.api';
import { validateEmployeeCreate, transformCreatePayload } from '@/lib/api/employee.api';
import { employeeCreateSchema, type EmployeeCreateFormData } from '@/lib/validation/employeeCreate';
import { saveEmployeeFormData, loadEmployeeFormData } from '@/utils/employeeForm';
import {
  ADM004_ROUTES,
  ADM004_MESSAGES,
  LABEL_TO_FIELD,
  CODE_TO_FIELD,
} from '@/constants/adm004';
import { ERR_CODE, getErrorMessage } from '@/constants/messages';
import type { DepartmentDTO } from '@/types/department';
import type { CertificationDTO } from '@/types/certification';

/**
 * Giá trị mặc định cho form ADM004 (tất cả trường rỗng).
 */
export const DEFAULT_FORM_VALUES: EmployeeCreateFormData = {
  employeeLoginId: '',
  departmentId: '',
  employeeName: '',
  employeeNameKana: '',
  employeeBirthDate: '',
  employeeEmail: '',
  employeeTelephone: '',
  employeeLoginPassword: '',
  employeeLoginPasswordConfirm: '',
  certificationId: '',
  certificationStartDate: '',
  certificationEndDate: '',
  certificationScore: '',
};

interface BackendErrorBody {
  message?: {
    code?: string;
    params?: (string | number)[];
  };
}

/**
 * Xác định field trên form tương ứng với mã lỗi backend trả về.
 *
 * @param code Mã lỗi (ví dụ ER006)
 * @param params Danh sách param kèm theo (có thể chứa nhãn trường)
 * @return Tên field hoặc null nếu không xác định được
 */
function resolveField(code: string, params: (string | number)[]): string | null {
  if (CODE_TO_FIELD[code]) {
    return CODE_TO_FIELD[code];
  }
  for (const param of params) {
    if (typeof param === 'string' && LABEL_TO_FIELD[param]) {
      return LABEL_TO_FIELD[param];
    }
  }
  return null;
}

/**
 * Hook điều khiển màn hình nhập liệu ADM004: tải master data, quản lý form (React Hook
 * Form + zod), gọi API validate rồi điều hướng sang màn xác nhận ADM005.
 *
 * @return Các giá trị và hàm xử lý cho màn hình ADM004
 */
export function useADM004() {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [certifications, setCertifications] = useState<CertificationDTO[]>([]);
  const [globalError, setGlobalError] = useState<string>('');

  const form = useForm<EmployeeCreateFormData>({
    resolver: zodResolver(employeeCreateSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [departmentRes, certificationRes] = await Promise.all([
          getDepartments(),
          getCertifications(),
        ]);
        if (!mounted) {
          return;
        }
        setDepartments(departmentRes.departments ?? []);
        setCertifications(certificationRes.certifications ?? []);
      } catch {
        if (mounted) {
          setGlobalError(ADM004_MESSAGES.masterLoadError);
        }
      }
    })();

    const saved = loadEmployeeFormData();
    if (saved) {
      form.reset({ ...DEFAULT_FORM_VALUES, ...saved });
    }

    return () => {
      mounted = false;
    };
  }, [form]);

  /**
   * Xử lý lỗi trả về từ backend: gắn vào field tương ứng hoặc hiển thị lỗi chung.
   */
  function handleBackendError(err: unknown): void {
    if (axios.isAxiosError(err) && err.response?.data) {
      const body = err.response.data as BackendErrorBody;
      const code = body.message?.code;
      const params = body.message?.params ?? [];
      if (code) {
        const message = getErrorMessage(code, params);
        const field = resolveField(code, params);
        if (field) {
          form.setError(field as keyof EmployeeCreateFormData, { type: 'server', message });
        } else {
          setGlobalError(message);
        }
        return;
      }
    }
    setGlobalError(getErrorMessage(ERR_CODE.ER023));
  }

  const onConfirm = form.handleSubmit(async (values) => {
    setGlobalError('');
    const payload = transformCreatePayload(values);
    try {
      await validateEmployeeCreate(payload);
      const department = departments.find(
        (item) => String(item.departmentId) === values.departmentId.trim(),
      );
      const certification = certifications.find(
        (item) => String(item.certificationId) === values.certificationId.trim(),
      );
      saveEmployeeFormData({
        ...values,
        departmentName: department?.departmentName,
        certificationName: certification?.certificationName,
      });
      router.push(ADM004_ROUTES.confirm);
    } catch (err) {
      handleBackendError(err);
    }
  });

  const onBack = () => {
    router.push(ADM004_ROUTES.list);
  };

  return {
    form,
    departments,
    certifications,
    globalError,
    onConfirm,
    onBack,
  };
}
