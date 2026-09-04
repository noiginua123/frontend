import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

import { getDepartments } from '@/lib/api/department.api';
import { getCertifications } from '@/lib/api/certification.api';
import { validateEmployeeCreate, transformCreatePayload } from '@/lib/api/employee.api';
import { employeeCreateSchema, type EmployeeCreateFormData } from '@/lib/validation/employeeCreate';
import { saveEmployeeFormData, loadEmployeeFormData, clearEmployeeFormData } from '@/utils/employeeForm';
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
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode');
  const id = searchParams?.get('id');

  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [certifications, setCertifications] = useState<CertificationDTO[]>([]);
  const [globalError, setGlobalError] = useState<string>('');

  const form = useForm<EmployeeCreateFormData>({
    // resolver: zodResolver(employeeCreateSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: DEFAULT_FORM_VALUES,
  });

  /**
   * Gọi API tải danh sách phòng ban cho dropdown グループ.
   */
  const fetchDepartments = useCallback(async (): Promise<void> => {
    try {
      const response = await getDepartments();
      setDepartments(response.departments ?? []);
    } catch {
      setDepartments([]);
      setGlobalError(ADM004_MESSAGES.masterLoadError);
    }
  }, []);

  /**
   * Gọi API tải danh sách chứng chỉ tiếng Nhật cho dropdown 資格.
   */
  const fetchCertifications = useCallback(async (): Promise<void> => {
    try {
      const response = await getCertifications();
      setCertifications(response.certifications ?? []);
    } catch {
      setCertifications([]);
      setGlobalError(ADM004_MESSAGES.masterLoadError);
    }
  }, []);

  // Tải danh sách phòng ban, chứng chỉ và khởi tạo dữ liệu form
  useEffect(() => {
    void fetchDepartments();
    void fetchCertifications();

    if (mode === 'back') {
      // Khi quay lại từ ADM005: khôi phục nguyên vẹn form đã lưu
      const saved = loadEmployeeFormData();
      if (saved) {
        form.reset({ ...DEFAULT_FORM_VALUES, ...saved });
      }
    } else {
      // Khi mở mới từ ADM002 hoặc F5 tại ADM004: xóa rác session cũ và reset form trắng
      clearEmployeeFormData();
      form.reset(DEFAULT_FORM_VALUES);
    }
  }, [fetchDepartments, fetchCertifications, form, mode, id]);

  // Theo dõi trường chứng chỉ tiếng Nhật đã chọn hay chưa
  const certificationId = form.watch('certificationId');
  const isCertificationSelected = Boolean(certificationId && certificationId.trim() !== '');
  const previousCertificationIdRef = useRef<string | undefined>(undefined);

  // Khi người dùng bỏ chọn chứng chỉ (về rỗng): xóa trắng giá trị và xóa lỗi của 3 trường liên quan
  useEffect(() => {
    if (
      previousCertificationIdRef.current !== undefined &&
      previousCertificationIdRef.current.trim() !== '' &&
      !isCertificationSelected
    ) {
      form.setValue('certificationStartDate', '');
      form.setValue('certificationEndDate', '');
      form.setValue('certificationScore', '');
      form.clearErrors(['certificationStartDate', 'certificationEndDate', 'certificationScore']);
    }
    previousCertificationIdRef.current = certificationId;
  }, [certificationId, isCertificationSelected, form]);

  // Lấy giá trị của cả 2 trường ngày
  const startDate = form.watch('certificationStartDate');
  const endDate = form.watch('certificationEndDate');

  // Tự động re-validate ô "失効日" (Ngày hết hạn) mỗi khi "資格交付日" (Ngày cấp) thay đổi
  useEffect(() => {
    // Nếu ô ngày hết hạn đã có giá trị hoặc đang có lỗi đỏ
    if (endDate || form.formState.errors.certificationEndDate) {
      void form.trigger('certificationEndDate');
    }
  }, [startDate, endDate, form]);


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
    clearEmployeeFormData();
    router.push(ADM004_ROUTES.list);
  };

  return {
    form,
    departments,
    certifications,
    globalError,
    isCertificationSelected,
    onConfirm,
    onBack,
  };
}
