'use client';

import { useAuth } from '@/hooks/useAuth';
import ADM005 from '@/components/employee/ADM005';

/**
 * Trang ADM005 - xác nhận thông tin nhân viên trước khi lưu.
 */
export default function EmployeeConfirmPage() {
  useAuth();
  return <ADM005 />;
}
