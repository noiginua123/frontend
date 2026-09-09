'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth/token';
import { ROUTES } from '@/constants/routes';

/**
 * Component trang xử lý đăng xuất, xóa token và điều hướng về trang đăng nhập.
 *
 * @return Giao diện thông báo đăng xuất
 */
export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    removeToken();
    router.push(ROUTES.AUTH.LOGIN);
  }, [router]);

  return <div>Logging out...</div>;
}

