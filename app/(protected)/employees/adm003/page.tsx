'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ADM003 from '@/components/employee/ADM003';

/**
 * Trang ADM003 - xem chi tiết thông tin nhân viên bọc trong Suspense boundary.
 *
 * @return Giao diện trang xem chi tiết nhân viên
 */
export default function EmployeeDetailPage() {
  useAuth();
  return (
    <Suspense fallback={null}>
      <ADM003 />
    </Suspense>
  );
}
