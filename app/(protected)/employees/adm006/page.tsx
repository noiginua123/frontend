'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ADM004_ROUTES, ADM006_MESSAGE_KEY } from '@/constants/adm004';
import { INFO_MESSAGES, MSG_CODE } from '@/constants/messages';

/**
 * Trang ADM006 - thông báo đăng ký nhân viên thành công.
 * Lấy message từ sessionStorage (do ADM005 ghi sau khi tạo thành công).
 */
export default function EmployeeCompletePage() {
  useAuth();
  const router = useRouter();
  const [message] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.sessionStorage.getItem(ADM006_MESSAGE_KEY);
      if (stored) {
        window.sessionStorage.removeItem(ADM006_MESSAGE_KEY);
        return stored;
      }
    }
    return INFO_MESSAGES[MSG_CODE.MSG001];
  });

  return (
    <div className="box-shadow">
      <div className="notification-box">
        <h1 className="msg-title">{message}</h1>
        <div className="notification-box-btn">
          <button
            type="button"
            onClick={() => router.push(ADM004_ROUTES.list)}
            className="btn btn-primary btn-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
