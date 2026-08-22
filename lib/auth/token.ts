/**
 * Lưu trữ access token và token type vào sessionStorage.
 *
 * @param token Chuỗi JWT access token
 * @param tokenType Loại token (Bearer)
 */
export function storeToken(token: string, tokenType: string): void {
  sessionStorage.setItem('access_token', token);
  sessionStorage.setItem('token_type', tokenType);
}

/**
 * Lấy access token và token type từ sessionStorage.
 *
 * @return Đối tượng chứa token và type, hoặc null nếu không tồn tại
 */
export function getToken(): { accessToken: string; tokenType: string } | null {
  const accessToken = sessionStorage.getItem('access_token');
  const tokenType = sessionStorage.getItem('token_type');

  if (accessToken && tokenType) {
    return { accessToken, tokenType };
  }
  return null;
}

/**
 * Xóa thông tin token khỏi sessionStorage khi đăng xuất.
 */
export function removeToken(): void {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('token_type');
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

