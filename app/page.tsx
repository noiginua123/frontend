'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '@/lib/auth/token';
import { ROUTES } from '@/constants/routes';

/**
 * Trang gốc (/) - Tự động điều hướng dựa trên trạng thái đăng nhập:
 * - Nếu đã đăng nhập và token còn hạn: Chuyển hướng sang danh sách nhân viên (/employees/adm002)
 * - Nếu chưa đăng nhập hoặc token đã hết hạn: Chuyển hướng sang trang đăng nhập (/login)
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token.accessToken)) {
      router.replace(ROUTES.EMPLOYEES.LIST);
    } else {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [router]);

  return null;
}
