'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ADM004 from '@/components/employee/ADM004';

function EmployeeCreateContent() {
  useAuth();
  return <ADM004 />;
}

/**
 * Trang ADM004 - nhập liệu thêm mới nhân viên bọc trong Suspense.
 */
export default function EmployeeCreatePage() {
  return (
    <Suspense fallback={null}>
      <EmployeeCreateContent />
    </Suspense>
  );
}
