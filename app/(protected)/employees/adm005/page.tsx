'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ADM005 from '@/components/employee/ADM005';

/**
 * Trang ADM005 - xác nhận thông tin nhân viên trước khi lưu bọc trong Suspense.
 */
export default function EmployeeConfirmPage() {
  useAuth();
  return (
    <Suspense fallback={null}>
      <ADM005 />
    </Suspense>
  );
}
