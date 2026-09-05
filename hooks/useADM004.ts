import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';

import { getDepartments } from '@/lib/api/department.api';
import { getCertifications } from '@/lib/api/certification.api';
import { validateEmployeeForm } from '@/lib/validation/validateEmployeeForm';
import { saveEmployeeFormData, loadEmployeeFormData, clearEmployeeFormData } from '@/utils/employeeForm';
import {
  ADM004_ROUTES,
  ADM004_MESSAGES,
} from '@/constants/adm004';
import type { DepartmentDTO } from '@/types/department';
import type { CertificationDTO } from '@/types/certification';

/**
 * Giá trị mặc định cho form ADM004 (tất cả trường rỗng).
 */
export const DEFAULT_FORM_VALUES: validateEmployeeForm = {
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

  const form = useForm<validateEmployeeForm>({
    resolver: zodResolver(validateEmployeeForm),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: DEFAULT_FORM_VALUES,
    shouldFocusError: false,
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
   * Lấy tên phòng ban từ danh mục theo departmentId.
   *
   * @param id ID phòng ban
   * @return Tên phòng ban hoặc undefined
   */
  const getDepartmentName = (id: string): string | undefined => {
    return departments.find((item) => String(item.departmentId) === id.trim())?.departmentName;
  };

  /**
   * Lấy tên chứng chỉ từ danh mục theo certificationId.
   *
   * @param id ID chứng chỉ
   * @return Tên chứng chỉ hoặc undefined
   */
  const getCertificationName = (id: string): string | undefined => {
    return certifications.find((item) => String(item.certificationId) === id.trim())?.certificationName;
  };

  const handleConfirm = form.handleSubmit((values) => {
    setGlobalError('');
    saveEmployeeFormData({
      ...values,
      departmentName: getDepartmentName(values.departmentId),
      certificationName: getCertificationName(values.certificationId),
    });
    router.push(ADM004_ROUTES.confirm);
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
    handleConfirm,
    onBack,
  };
}
