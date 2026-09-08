'use client';

import { useAuth } from '@/hooks/useAuth';
import ADM006 from '@/components/employee/ADM006';

/**
 * Trang ADM006 - thông báo hoàn thành đăng ký / cập nhật nhân viên.
 */
export default function EmployeeCompletePage() {
  useAuth();
  return <ADM006 />;
}

