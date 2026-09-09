'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { ERR_MSG_TEMPLATES, ERR_CODE } from '@/constants/messages';

interface SystemErrorProps {
  message?: string;
  onAction?: () => void;
  buttonLabel?: string;
}

/**
 * Component hiển thị màn hình thông báo lỗi hệ thống (System Error).
 * Sử dụng class notification-box và note-err đồng bộ theo thiết kế hệ thống.
 *
 * @param props Các thuộc tính tùy biến message, hành động khi click nút và nhãn nút
 * @return Giao diện màn hình System Error
 */
export default function SystemError({
  message = ERR_MSG_TEMPLATES[ERR_CODE.ER023],
  onAction,
  buttonLabel = 'OK',
}: SystemErrorProps) {
  const router = useRouter();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      router.push(ROUTES.EMPLOYEES.LIST);
    }
  };

  return (
    <div className="box-shadow">
      <div className="notification-box">
        <h1 className="note-err">{message}</h1>
        <div className="notification-box-btn">
          <button
            type="button"
            onClick={handleAction}
            className="btn btn-primary btn-sm"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
