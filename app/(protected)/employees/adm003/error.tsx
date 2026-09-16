'use client';

import React, { useEffect } from 'react';
import SystemError from '@/components/common/SystemError';

interface ADM003ErrorProps {
  error: Error & { digest?: string };
  reset?: () => void;
}

/**
 * Next.js Error Boundary cho màn hình ADM003.
 * Tự động bắt mọi runtime exception không mong muốn và hiển thị màn hình System Error.
 *
 * @param props Đối tượng chứa thông tin lỗi và hàm reset thử lại
 * @return Màn hình thông báo lỗi hệ thống
 */
export default function ADM003Error({ error }: ADM003ErrorProps) {
  useEffect(() => {
    console.error('ADM003 Runtime Error:', error);
  }, [error]);

  return <SystemError />;
}
