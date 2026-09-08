'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ADM004 from '@/components/employee/ADM004';

/**
 * Trang ADM004 - nhập liệu thêm mới/chỉnh sửa nhân viên bọc trong Suspense.
 */
export default function EmployeeCreatePage() {
  useAuth();
  return (
    <Suspense fallback={null}>
      <ADM004 />
    </Suspense>
  );
}
