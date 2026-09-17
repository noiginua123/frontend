'use client';

import React from 'react';
import { useADM003 } from '@/hooks/useADM003';
import SystemError from '@/components/common/SystemError';
import {
  BUTTON_LABELS,
  EMPLOYEE_MESSAGES,
  FIELD_LABELS,
  SCREEN_TITLES,
} from '@/constants';

/**
 * Component hiển thị thông tin chi tiết nhân viên (ADM003).
 */
export default function ADM003() {
  const {
    employee,
    loading,
    isDeleting,
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
          <p>{EMPLOYEE_MESSAGES.loading}</p>
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
            <li className="title">{SCREEN_TITLES.ADM003_DETAIL}</li>
            <li className="box-err">
              <div className="box-err-content">{errorMessage}</div>
            </li>
            <li className="form-group row d-flex">
              <div className="btn-group col-sm col-sm-10 ml">
                <button type="button" onClick={handleBack} className="btn btn-secondary btn-sm">
                  {BUTTON_LABELS.BACK}
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
          <li className="title">{SCREEN_TITLES.ADM003_DETAIL}</li>

          {errorMessage && (
            <li className="box-err">
              <div className="box-err-content">{errorMessage}</div>
            </li>
          )}

          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.LOGIN_ID}</label>
            <div className="col-sm col-sm-10 text-break">{employee.employeeLoginId}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.GROUP}</label>
            <div className="col-sm col-sm-10 text-break">{employee.departmentName}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.FULLNAME}</label>
            <div className="col-sm col-sm-10 text-break">{employee.employeeName}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.FULLNAME_KANA}</label>
            <div className="col-sm col-sm-10 text-break">{employee.employeeNameKana}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.BIRTH_DATE}</label>
            <div className="col-sm col-sm-10 text-break">{employee.employeeBirthDate}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.EMAIL}</label>
            <div className="col-sm col-sm-10 text-break">{employee.employeeEmail}</div>
          </li>
          <li className="form-group row d-flex bor-none">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.TEL}</label>
            <div className="col-sm col-sm-10 text-break">{employee.employeeTelephone}</div>
          </li>

          {/* Phần thông tin chứng chỉ tiếng Nhật (luôn hiển thị, để trống khi không có chứng chỉ) */}
          <li className="title mt-12"><a href="#!">{SCREEN_TITLES.SECTION_JAPANESE_LEVEL}</a></li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.CERTIFICATION}</label>
            <div className="col-sm col-sm-10">{cert?.certificationName || ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.START_DATE}</label>
            <div className="col-sm col-sm-10">{cert?.startDate || ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.END_DATE}</label>
            <div className="col-sm col-sm-10">{cert?.endDate || ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.SCORE}</label>
            <div className="col-sm col-sm-10">{cert?.score != null ? String(cert.score) : ''}</div>
          </li>

          {/* Nhóm nút bấm hành động */}
          <li className="form-group row d-flex">
            <div className="btn-group col-sm col-sm-10 ml">
              <button
                type="button"
                onClick={handleEdit}
                disabled={isDeleting}
                className="btn btn-primary btn-sm"
              >
                {BUTTON_LABELS.EDIT}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-secondary btn-sm"
              >
                {BUTTON_LABELS.DELETE}
              </button>
              <button
                type="button"
                onClick={handleBack}
                disabled={isDeleting}
                className="btn btn-secondary btn-sm"
              >
                {BUTTON_LABELS.BACK}
              </button>
            </div>
          </li>
        </ul>
      </form>
    </div>
  );
}
