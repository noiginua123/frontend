import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';

import { getDepartments } from '@/lib/api/department.api';
import { getCertifications } from '@/lib/api/certification.api';
import {
  employeeFormSchema,
  type EmployeeFormData,
} from '@/lib/validation/validateEmployeeForm';
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
export const DEFAULT_FORM_VALUES: EmployeeFormData = {
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

  const [initialFormValues] = useState<EmployeeFormData>(() => {
    if (mode !== 'back') {
      return DEFAULT_FORM_VALUES;
    }

    const savedForm = loadEmployeeFormData();
    return savedForm
      ? { ...DEFAULT_FORM_VALUES, ...savedForm }
      : DEFAULT_FORM_VALUES;
  });

  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [certifications, setCertifications] = useState<CertificationDTO[]>([]);
  const [globalError, setGlobalError] = useState<string>('');

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: initialFormValues,
    shouldFocusError: false,
  });

  // Tải đồng thời danh sách phòng ban và chứng chỉ.
  useEffect(() => {
    let isActive = true;

    void Promise.allSettled([getDepartments(), getCertifications()]).then(
      ([departmentResult, certificationResult]) => {
        if (!isActive) {
          return;
        }

        if (departmentResult.status === 'fulfilled') {
          setDepartments(departmentResult.value.departments ?? []);
        }
        if (certificationResult.status === 'fulfilled') {
          setCertifications(certificationResult.value.certifications ?? []);
        }
        if (
          departmentResult.status === 'rejected' ||
          certificationResult.status === 'rejected'
        ) {
          setGlobalError(ADM004_MESSAGES.masterLoadError);
        }
      },
    );

    return () => {
      isActive = false;
    };
  }, []);

  // Khi mở form mới, loại bỏ dữ liệu xác nhận còn lại từ lần nhập trước.
  useEffect(() => {
    if (mode !== 'back') {
      clearEmployeeFormData();
    }
  }, [mode]);

  // Đồng bộ lại giá trị phòng ban khi danh sách phòng ban đã tải xong ở chế độ quay lại (tránh bị reset do options load bất đồng bộ).
  useEffect(() => {
    if (mode === 'back' && departments.length > 0) {
      const savedForm = loadEmployeeFormData();
      if (savedForm?.departmentId) {
        form.setValue('departmentId', savedForm.departmentId, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    }
  }, [mode, departments, form]);

  // Đồng bộ lại giá trị trình độ tiếng Nhật khi danh sách chứng chỉ đã tải xong ở chế độ quay lại.
  useEffect(() => {
    if (mode === 'back' && certifications.length > 0) {
      const savedForm = loadEmployeeFormData();
      if (savedForm?.certificationId) {
        form.setValue('certificationId', savedForm.certificationId, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    }
  }, [mode, certifications, form]);

  const certificationId = useWatch({
    control: form.control,
    name: 'certificationId',
  });
  const isCertificationSelected = Boolean(
    certificationId && certificationId.trim() !== '',
  );

  /**
   * Xóa dữ liệu phụ thuộc khi người dùng bỏ chọn chứng chỉ.
   *
   * @param selectedCertificationId ID chứng chỉ vừa chọn
   */
  const handleCertificationChange = (
    selectedCertificationId: string,
  ): void => {
    if (selectedCertificationId.trim() === '') {
      form.setValue('certificationStartDate', '');
      form.setValue('certificationEndDate', '');
      form.setValue('certificationScore', '');
      form.clearErrors([
        'certificationStartDate',
        'certificationEndDate',
        'certificationScore',
      ]);
    }
  };

  /**
   * Kiểm tra lại ngày hết hạn ngay sau khi ngày cấp thay đổi.
   */
  const handleCertificationStartDateChange = (): void => {
    const currentEndDate = form.getValues('certificationEndDate');
    if (currentEndDate || form.formState.errors.certificationEndDate) {
      void form.trigger('certificationEndDate');
    }
  };

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

  /**
   * Xử lý quay lại màn hình danh sách nhân viên ADM002 và dọn dẹp dữ liệu tạm.
   */
  const handleBack = () => {
    clearEmployeeFormData();
    router.push(ADM004_ROUTES.list);
  };

  return {
    form,
    departments,
    certifications,
    globalError,
    isCertificationSelected,
    handleCertificationChange,
    handleCertificationStartDateChange,
    handleConfirm,
    handleBack,
    onBack: handleBack,
  };
}
