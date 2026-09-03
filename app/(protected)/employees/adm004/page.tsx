'use client';

import { useAuth } from '@/hooks/useAuth';
import EmployeeInputForm from '@/components/employee/EmployeeInputForm';

/**
 * Trang ADM004 - nhập liệu thêm mới nhân viên.
 */
export default function EmployeeCreatePage() {
  useAuth();
  return <EmployeeInputForm />;
}
