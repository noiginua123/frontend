import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '@/lib/auth/token';

/**
 * Hook kiểm tra xác thực người dùng cho các trang bảo vệ (protected).
 * Tự động chuyển hướng về trang login nếu chưa đăng nhập hoặc token đã hết hạn.
 */
const useAuth = (): void => {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token.accessToken)) {
      router.push('/login');
    }
  }, [router]);
};

/**
 * Hook kiểm tra trạng thái khách (chưa đăng nhập) cho các trang công khai như login.
 * Tự động chuyển hướng vào trang danh sách nhân viên nếu người dùng đã đăng nhập hợp lệ.
 */
const useGuest = (): void => {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token.accessToken)) {
      router.push('/employees/adm002');
    }
  }, [router]);
};

export { useAuth, useGuest };
