'use client';

import React from 'react';
import { useADM003 } from '@/hooks/useADM003';
import SystemError from '@/components/common/SystemError';

/**
 * Component hiển thị thông tin chi tiết nhân viên (ADM003).
 */
export default function ADM003() {
  const {
    employee,
    loading,
    errorMessage,
    isSystemError,
    handleEdit,
    handleDelete,
    handleBack,
  } = useADM003();

  // Đang tải dữ liệu
  if (loading) {
    return (
      <div className="row">
        <div className="c-form box-shadow p-4 text-center">
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  // Khi gặp lỗi hệ thống (System Error - ER023 / ER015 / Network Error / 500)
  if (isSystemError) {
    return (
      <SystemError
        message={errorMessage || undefined}
        onAction={handleBack}
      />
    );
  }

  // Khi có lỗi nghiệp vụ (ví dụ không tìm thấy nhân viên ER013)
  if (errorMessage && !employee) {
    return (
      <div className="row">
        <div className="c-form box-shadow">
          <ul className="show-data">
            <li className="title">情報確認</li>
            <li className="box-err">
              <div className="box-err-content">{errorMessage}</div>
            </li>
            <li className="form-group row d-flex">
              <div className="btn-group col-sm col-sm-10 ml">
                <button type="button" onClick={handleBack} className="btn btn-secondary btn-sm">
                  戻る
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const cert = employee.certifications && employee.certifications.length > 0
    ? employee.certifications[0]
    : null;

  return (
    <div className="row">
      <form className="c-form box-shadow" onSubmit={(e) => e.preventDefault()}>
        <ul className="show-data">
          <li className="title">情報確認</li>

          {errorMessage && (
            <li className="box-err">
              <div className="box-err-content">{errorMessage}</div>
            </li>
          )}

          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">アカウント名</label>
            <div className="col-sm col-sm-10">{employee.employeeLoginId}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">グループ</label>
            <div className="col-sm col-sm-10">{employee.departmentName}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">氏名</label>
            <div className="col-sm col-sm-10">{employee.employeeName}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">カタカナ氏名</label>
            <div className="col-sm col-sm-10">{employee.employeeNameKana}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">生年月日</label>
            <div className="col-sm col-sm-10">{employee.employeeBirthDate}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">メールアドレス</label>
            <div className="col-sm col-sm-10">{employee.employeeEmail}</div>
          </li>
          <li className="form-group row d-flex bor-none">
            <label className="col-form-label col-sm-2">電話番号</label>
            <div className="col-sm col-sm-10">{employee.employeeTelephone}</div>
          </li>

          {/* Phần thông tin chứng chỉ tiếng Nhật (luôn hiển thị, để trống khi không có chứng chỉ) */}
          <li className="title mt-12"><a href="#!">日本語能力</a></li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">資格</label>
            <div className="col-sm col-sm-10">{cert?.certificationName || ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">資格交付日</label>
            <div className="col-sm col-sm-10">{cert?.startDate || ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">失効日</label>
            <div className="col-sm col-sm-10">{cert?.endDate || ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">点数</label>
            <div className="col-sm col-sm-10">{cert?.score != null ? String(cert.score) : ''}</div>
          </li>

          {/* Nhóm nút bấm hành động */}
          <li className="form-group row d-flex">
            <div className="btn-group col-sm col-sm-10 ml">
              <button
                type="button"
                onClick={handleEdit}
                className="btn btn-primary btn-sm"
              >
                編集
              </button>
              {/* TODO: Nút xóa nhân viên (Hạng mục 29 - API 08) */}
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-secondary btn-sm"
              >
                削除
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary btn-sm"
              >
                戻る
              </button>
            </div>
          </li>
        </ul>
      </form>
    </div>
  );
}
