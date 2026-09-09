'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/storage';
import { INFO_MESSAGES, MSG_CODE } from '@/constants/messages';

/**
 * Component hiển thị thông báo hoàn thành thao tác nhân viên (ADM006).
 * Lấy nội dung thông báo từ sessionStorage (do ADM003 hoặc ADM005 thiết lập khi thực hiện thành công).
 */
export default function ADM006() {
  const router = useRouter();

  // Đọc nội dung thông báo thành công từ sessionStorage và dọn dẹp ngay sau khi đọc
  const [message] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.sessionStorage.getItem(STORAGE_KEYS.ADM006_SUCCESS_MESSAGE);
      if (stored) {
        window.sessionStorage.removeItem(STORAGE_KEYS.ADM006_SUCCESS_MESSAGE);
        return stored;
      }
    }
    // Giá trị fallback mặc định: Đăng ký thành công (MSG001)
    return INFO_MESSAGES[MSG_CODE.MSG001];
  });

  return (
    <div className="box-shadow">
      {/* Hộp thông báo hoàn thành thao tác (Notification Box) */}
      <div className="notification-box">
        {/* 1. Nội dung thông báo hoàn thành */}
        <h1 className="msg-title">{message}</h1>

        {/* 2. Nút bấm quay về màn hình danh sách nhân viên ADM002 */}
        <div className="notification-box-btn">
          <button
            type="button"
            onClick={() => router.push(ROUTES.EMPLOYEES.LIST)}
            className="btn btn-primary btn-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
