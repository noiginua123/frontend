'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// --- Danh sách Import (Hằng số, API, Kiểu dữ liệu, Tiện ích) ---
import { getDepartments } from '@/lib/api/department.api';
import { getCertifications } from '@/lib/api/certification.api';
import { getEmployeeDetail } from '@/lib/api/employee.api';
import {
  employeeCreateSchema,
  employeeEditSchema,
  type EmployeeFormData,
} from '@/lib/validation/validateEmployeeForm';
import {
  saveEmployeeFormData,
  loadEmployeeFormData,
  clearEmployeeFormData,
  type FormMode,
} from '@/utils/storage';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/storage';
import { ADM004_MESSAGES } from '@/constants/employee';
import type { DepartmentDTO } from '@/types/department';
import type { CertificationDTO } from '@/types/certification';

/**
 * Giá trị mặc định cho biểu mẫu ADM004 (tất cả các trường để rỗng).
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
 * Hook quản lý toàn bộ luồng nghiệp vụ của màn hình nhập liệu thông tin nhân viên (ADM004).
 * Xử lý: Nạp dữ liệu danh mục, nạp dữ liệu chỉnh sửa, khôi phục từ bộ nhớ phiên, xác thực biểu mẫu và điều hướng.
 *
 * @return Các trạng thái, phương thức biểu mẫu và hàm xử lý sự kiện cần thiết cho màn hình ADM004
 */
export const useADM004 = () => {
  /** Hook điều hướng trang */
  const router = useRouter();

  /** Hook đọc tham số truy vấn từ URL hiện tại */
  const searchParams = useSearchParams();

  // --- 1. Trạng thái và Cấu hình ---

  /** Tham số chế độ thô từ URL ('add', 'edit' hoặc 'back') */
  const rawMode = searchParams?.get('mode');

  /** Cờ xác định người dùng đang quay lại từ màn hình xác nhận ADM005 */
  const isBack = searchParams?.get('back') === '1' || rawMode === 'back';

  /** ID nhân viên dạng chuỗi từ URL (undefined nếu ở chế độ thêm mới) */
  const idParam = searchParams?.get('id');
  const id = idParam ? idParam.trim() : undefined;

  /** Chế độ hoạt động: 'add' (thêm mới) hoặc 'edit' (chỉnh sửa) */
  const mode: FormMode = rawMode === 'edit' || (!rawMode && Boolean(id)) ? 'edit' : 'add';
  const isEdit = mode === 'edit';

  /** Danh sách phòng ban (Dữ liệu danh mục) để hiển thị danh sách lựa chọn */
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);

  /** Danh sách chứng chỉ tiếng Nhật (Dữ liệu danh mục) để hiển thị danh sách lựa chọn */
  const [certifications, setCertifications] = useState<CertificationDTO[]>([]);

  /** Trạng thái đang tải thông tin chi tiết nhân viên từ máy chủ (chế độ Chỉnh sửa) */
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  /** Thông báo lỗi toàn cục trên màn hình (đọc từ sessionStorage nếu quay lại từ ADM005) */
  const [globalError, setGlobalError] = useState<string>(() => {
    if (typeof window === 'undefined' || !isBack) {
      return '';
    }
    const rawError = window.sessionStorage.getItem(STORAGE_KEYS.ADM004_ERROR);
    if (!rawError) {
      return '';
    }
    window.sessionStorage.removeItem(STORAGE_KEYS.ADM004_ERROR);
    return rawError;
  });

  /** Dữ liệu khởi tạo ban đầu cho biểu mẫu (khôi phục ngay khi khởi tạo nếu ở chế độ Quay lại) */
  const [initialFormValues] = useState<EmployeeFormData>(() => {
    if (isBack) {
      const savedForm = loadEmployeeFormData();
      if (savedForm) {
        return { ...DEFAULT_FORM_VALUES, ...savedForm };
      }
    }
    return DEFAULT_FORM_VALUES;
  });

  // Khởi tạo React Hook Form với lược đồ xác thực Zod tương ứng theo chế độ (Thêm mới / Chỉnh sửa)
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(
      isEdit ? employeeEditSchema : employeeCreateSchema,
    ) as unknown as Resolver<EmployeeFormData>,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: initialFormValues,
    shouldFocusError: false,
  });

  const { reset, getValues, setValue, clearErrors, trigger, handleSubmit, formState } = form;

  /** Theo dõi trường certificationId theo thời gian thực để ẩn/hiện cụm nhập ngày và điểm */
  const certificationId = useWatch({
    control: form.control,
    name: 'certificationId',
  });

  /** Cờ xác định người dùng đã chọn chứng chỉ tiếng Nhật hay chưa */
  const isCertificationSelected = Boolean(certificationId && certificationId.trim() !== '');

  // --- 2. Vòng đời và Khởi tạo dữ liệu ---

  /**
   * Tải dữ liệu danh mục phòng ban và chứng chỉ từ máy chủ.
   */
  const loadMasterData = useCallback(async () => {
    try {
      const [departmentResult, certificationResult] = await Promise.allSettled([
        getDepartments(),
        getCertifications(),
      ]);

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
    } catch {
      setGlobalError(ADM004_MESSAGES.masterLoadError);
    }
  }, []);

  /**
   * Khởi tạo dữ liệu ban đầu cho biểu mẫu:
   * 1. Nếu ở chế độ quay lại: khôi phục nguyên vẹn từ bộ nhớ phiên, không gọi lại cơ sở dữ liệu.
   * 2. Nếu là Chỉnh sửa mới: gọi API lấy thông tin nhân viên từ cơ sở dữ liệu để điền vào biểu mẫu.
   * 3. Nếu là Thêm mới: khởi tạo biểu mẫu rỗng theo giá trị mặc định.
   */
  const loadInitData = useCallback(async () => {
    // 1. Nhánh quay lại từ màn hình xác nhận
    if (isBack) {
      const savedForm = loadEmployeeFormData();
      const isMatched =
        savedForm &&
        (mode === 'add'
          ? !savedForm.employeeId
          : savedForm.employeeId != null && String(savedForm.employeeId) === String(id));

      if (isMatched || (savedForm && !id)) {
        reset({ ...DEFAULT_FORM_VALUES, ...savedForm });
        return;
      }
    }

    // Luôn dọn sạch dữ liệu tạm cũ khi mở mới
    clearEmployeeFormData();

    // 2. Nhánh mở mới Chỉnh sửa
    if (isEdit) {
      if (!id || id.trim() === '' || isNaN(Number(id))) {
        router.replace(ROUTES.SYSTEM_ERROR);
        return;
      }

      setIsLoadingDetail(true);
      try {
        const detail = await getEmployeeDetail(id);
        const primaryCert = detail?.certifications?.[0];

        reset({
          employeeLoginId: detail?.employeeLoginId ?? '',
          departmentId: detail?.departmentId ? String(detail.departmentId) : '',
          employeeName: detail?.employeeName ?? '',
          employeeNameKana: detail?.employeeNameKana ?? '',
          employeeBirthDate: detail?.employeeBirthDate ?? '',
          employeeEmail: detail?.employeeEmail ?? '',
          employeeTelephone: detail?.employeeTelephone ?? '',
          employeeLoginPassword: '',        // Luôn để rỗng khi sửa (không đổi mật khẩu cũ)
          employeeLoginPasswordConfirm: '', // Luôn để rỗng khi sửa
          certificationId: primaryCert?.certificationId ? String(primaryCert.certificationId) : '',
          certificationStartDate: primaryCert?.startDate ?? '',
          certificationEndDate: primaryCert?.endDate ?? '',
          certificationScore: primaryCert?.score != null ? String(primaryCert.score) : '',
        });
      } catch {
        // Xử lý khi có lỗi kết nối
      } finally {
        setIsLoadingDetail(false);
      }
      return;
    }

    // 3. Nhánh mở mới Thêm mới
    reset(DEFAULT_FORM_VALUES);
  }, [isBack, mode, id, isEdit, reset, router]);

  // Tự động tải dữ liệu danh mục khi thành phần được gắn vào giao diện
  useEffect(() => {
    void loadMasterData();
  }, [loadMasterData]);

  const hasInitializedRef = useRef(false);

  // Tự động tải dữ liệu ban đầu cho biểu mẫu khi thành phần được gắn vào giao diện
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    void loadInitData();
  }, [loadInitData]);

  // Đồng bộ lại giá trị hộp chọn phòng ban khi danh sách tùy chọn tải xong
  useEffect(() => {
    if (departments.length > 0) {
      const currentDeptId = getValues('departmentId');
      if (currentDeptId) {
        setValue('departmentId', currentDeptId, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    }
  }, [departments, getValues, setValue]);

  // Đồng bộ lại giá trị hộp chọn chứng chỉ khi danh sách tùy chọn tải xong
  useEffect(() => {
    if (certifications.length > 0) {
      const currentCertId = getValues('certificationId');
      if (currentCertId) {
        setValue('certificationId', currentCertId, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
    }
  }, [certifications, getValues, setValue]);

  // --- 3. Các hàm xử lý sự kiện ---

  /**
   * Xóa sạch dữ liệu phụ thuộc khi người dùng bỏ chọn chứng chỉ.
   *
   * @param selectedCertificationId ID chứng chỉ vừa chọn
   */
  const handleCertificationChange = useCallback((selectedCertificationId: string): void => {
    if (selectedCertificationId.trim() === '') {
      setValue('certificationStartDate', '');
      setValue('certificationEndDate', '');
      setValue('certificationScore', '');
      clearErrors([
        'certificationStartDate',
        'certificationEndDate',
        'certificationScore',
      ]);
    }
  }, [setValue, clearErrors]);

  /**
   * Kích hoạt kiểm tra lại ngày hết hạn ngay sau khi ngày cấp thay đổi.
   */
  const handleCertificationStartDateChange = useCallback((): void => {
    const currentEndDate = getValues('certificationEndDate');
    if (currentEndDate || formState.errors.certificationEndDate) {
      void trigger('certificationEndDate');
    }
  }, [getValues, formState.errors.certificationEndDate, trigger]);

  /**
   * Xử lý xác nhận biểu mẫu để chuyển sang màn hình xác nhận ADM005.
   */
  const handleConfirm = handleSubmit((values: EmployeeFormData) => {
    setGlobalError('');
    const finalLoginId = values.employeeLoginId || getValues('employeeLoginId') || '';

    saveEmployeeFormData({
      ...values,
      employeeLoginId: finalLoginId,
      mode,
      employeeId: isEdit ? id : undefined,
      departmentName: getDepartmentName(values.departmentId),
      certificationName: getCertificationName(values.certificationId),
    });

    const confirmUrl = isEdit && id
      ? `${ROUTES.EMPLOYEES.CONFIRM}?mode=edit&id=${id}`
      : `${ROUTES.EMPLOYEES.CONFIRM}?mode=add`;
    router.push(confirmUrl);
  });

  /**
   * Xử lý quay lại (Hủy bỏ / Quay lại):
   * - Nếu Chỉnh sửa: quay về màn hình xem chi tiết ADM003.
   * - Nếu Thêm mới: quay về màn hình danh sách ADM002.
   */
  const handleBack = useCallback(() => {
    clearEmployeeFormData();
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(STORAGE_KEYS.ADM004_ERROR);
    }
    if (isEdit && id) {
      router.push(ROUTES.EMPLOYEES.DETAIL(id));
    } else {
      router.push(ROUTES.EMPLOYEES.LIST);
    }
  }, [isEdit, id, router]);

  // --- 4. Các hàm hỗ trợ nội bộ ---

  /**
   * Lấy tên phòng ban từ danh mục theo departmentId.
   */
  const getDepartmentName = (deptId: string): string | undefined => {
    return departments.find((item) => String(item.departmentId) === deptId.trim())?.departmentName;
  };

  /**
   * Lấy tên chứng chỉ từ danh mục theo certificationId.
   */
  const getCertificationName = (certId: string): string | undefined => {
    return certifications.find((item) => String(item.certificationId) === certId.trim())?.certificationName;
  };

  return {
    // Dữ liệu danh mục & Trạng thái giao diện
    departments,
    certifications,
    globalError,
    isLoadingDetail,
    isCertificationSelected,

    // Trạng thái chế độ & Điều hướng
    mode,
    isEdit,
    employeeId: id,

    // Dữ liệu & Phương thức biểu mẫu
    form,

    // Các hàm xử lý sự kiện & Hành động
    handleCertificationChange,
    handleCertificationStartDateChange,
    handleConfirm,
    handleBack,
    onBack: handleBack,
    handleCancel: handleBack,
    loadInitData,
  };
};
