'use client';

import { useAuth } from '@/hooks/useAuth';
import EmployeeConfirmForm from '@/components/employee/EmployeeConfirmForm';

/**
 * Trang ADM005 - xác nhận thông tin nhân viên trước khi lưu.
 */
export default function EmployeeConfirmPage() {
  useAuth();
  return <EmployeeConfirmForm />;
}
