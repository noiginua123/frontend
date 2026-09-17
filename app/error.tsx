'use client';

import React, { useEffect } from 'react';
import SystemError from '@/components/common/SystemError';

interface ErrorProps {
  error: Error & { digest?: string };
  reset?: () => void;
}

/**
 * Next.js Error Boundary dùng chung cho toàn bộ ứng dụng.
 * Tự động bắt mọi runtime exception không mong muốn và hiển thị màn hình System Error.
 *
 * @param props Đối tượng chứa thông tin lỗi và hàm reset thử lại
 * @return Màn hình thông báo lỗi hệ thống
 */
export default function AppError({ error }: ErrorProps) {
  useEffect(() => {
    console.error('Application Runtime Error:', error);
  }, [error]);

  return <SystemError />;
}
