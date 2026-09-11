'use client';

import React from 'react';
import { useADM006 } from '@/hooks/useADM006';

/**
 * Component hiển thị thông báo hoàn thành thao tác nhân viên (ADM006).
 * Sử dụng hook useADM006 để quản lý nội dung thông báo và hành động quay về màn hình danh sách.
 */
export default function ADM006() {
  const { message, handleOk } = useADM006();

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
            onClick={handleOk}
            className="btn btn-primary btn-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
