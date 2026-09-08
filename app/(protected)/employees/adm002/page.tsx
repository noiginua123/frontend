'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ADM002 from '@/components/employee/ADM002';

/**
 * Trang ADM002 - xem danh sách nhân viên bọc trong Suspense Boundary.
 *
 * @return Giao diện trang danh sách nhân viên
 */
export default function EmployeeListPage() {
  useAuth();
  return (
    <Suspense fallback={null}>
      <ADM002 />
    </Suspense>
  );
}

