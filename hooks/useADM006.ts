'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- Danh sách Import (Hằng số, Tiện ích) ---
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/storage';
import { INFO_MESSAGES, MSG_CODE } from '@/constants/messages';

/**
 * Hook quản lý toàn bộ luồng nghiệp vụ của màn hình hoàn tất thao tác nhân viên (ADM006).
 * Xử lý: Đọc thông báo thành công từ bộ nhớ phiên (sessionStorage) và điều hướng quay lại danh sách ADM002 khi bấm OK.
 *
 * @return Thông báo thành công và hàm xử lý khi nhấn OK
 */
export function useADM006() {
  /** Hook điều hướng trang */
  const router = useRouter();

  // --- 1. Trạng thái và Cấu hình ---

  /** Nội dung thông báo thành công (đọc từ sessionStorage và dọn sạch ngay sau khi đọc) */
  const [message] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.sessionStorage.getItem(STORAGE_KEYS.ADM006_SUCCESS_MESSAGE);
      if (stored) {
        window.sessionStorage.removeItem(STORAGE_KEYS.ADM006_SUCCESS_MESSAGE);
        return stored;
      }
    }
    // Giá trị dự phòng mặc định: Đăng ký người dùng thành công (MSG001)
    return INFO_MESSAGES[MSG_CODE.MSG001];
  });

  // --- 3. Các hàm xử lý sự kiện ---

  /**
   * Xử lý điều hướng quay về màn hình danh sách nhân viên ADM002 khi bấm nút OK.
   */
  const handleOk = useCallback((): void => {
    router.push(ROUTES.EMPLOYEES.LIST);
  }, [router]);

  return {
    // Thông báo & Trạng thái hoàn tất
    message,

    // Các hàm xử lý hành động
    handleOk,
  };
}
