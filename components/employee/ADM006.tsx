'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ADM004_ROUTES, ADM006_MESSAGE_KEY } from '@/constants/adm004';
import { INFO_MESSAGES, MSG_CODE } from '@/constants/messages';

/**
 * Component hiển thị thông báo hoàn thành thao tác nhân viên (ADM006).
 * Lấy nội dung thông báo từ sessionStorage (do ADM005 thiết lập khi thực hiện thành công).
 */
export default function ADM006() {
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
