import { STORAGE_KEYS } from '@/constants/storage';

/**
 * Lưu trữ access token và token type vào sessionStorage.
 *
 * @param token Chuỗi JWT access token
 * @param tokenType Loại token (Bearer)
 */
export function storeToken(token: string, tokenType: string): void {
  sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  sessionStorage.setItem(STORAGE_KEYS.TOKEN_TYPE, tokenType);
}

/**
 * Lấy access token và token type từ sessionStorage.
 *
 * @return Đối tượng chứa token và type, hoặc null nếu không tồn tại
 */
export function getToken(): { accessToken: string; tokenType: string } | null {
  const accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const tokenType = sessionStorage.getItem(STORAGE_KEYS.TOKEN_TYPE);

  if (accessToken && tokenType) {
    return { accessToken, tokenType };
  }
  return null;
}

/**
 * Xóa thông tin token khỏi sessionStorage khi đăng xuất.
 */
export function removeToken(): void {
  sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN_TYPE);
  sessionStorage.removeItem(STORAGE_KEYS.ADM002_FILTER);
}

/**
 * Kiểm tra token JWT đã hết hạn hay chưa.
 *
 * @param token Chuỗi JWT token
 * @return true nếu token đã hết hạn hoặc không hợp lệ, ngược lại false
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

