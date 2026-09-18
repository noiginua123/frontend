'use client';

import { useADM005 } from '@/hooks/useADM005';
import {
  BUTTON_LABELS,
  FIELD_LABELS,
  SCREEN_TITLES,
} from '@/constants';

/**
 * Màn hình xác nhận thông tin trước khi đăng ký nhân viên (ADM005).
 * Chỉ hiển thị (read-only) dữ liệu đã nhập ở ADM004.
 */
export default function ADM005() {
  const { formData, submitting, globalError, handleSubmit, handleBack } = useADM005();

  // Khi chưa có dữ liệu form từ sessionStorage (tránh lỗi render khi truy cập trực tiếp URL)
  if (!formData) {
    return null;
  }

  // Kiểm tra nhân viên có chọn chứng chỉ tiếng Nhật hay không để hiển thị tương ứng
  const hasCertification = Boolean(formData.certificationId);

  return (
    <div className="row">
      <form className="c-form box-shadow">
        <ul className="show-data">
          {/* Tiêu đề màn hình và lời nhắc xác nhận */}
          <li className="title">
            <p>{SCREEN_TITLES.ADM005_CONFIRM}</p>
            <p>{SCREEN_TITLES.ADM005_CONFIRM_DESC}</p>
          </li>

          {/* Khối hiển thị thông báo lỗi từ backend (nếu có) */}
          {globalError && (
            <li className="box-err">
              <div className="box-err-content">{globalError}</div>
            </li>
          )}

          {/* PHẦN 1: THÔNG TIN TÀI KHOẢN VÀ THÔNG TIN CÁ NHÂN (CHẾ ĐỘ XEM) */}
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.LOGIN_ID}</label>
            <div className="col-sm col-sm-10 text-break">{formData.employeeLoginId}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.GROUP}</label>
            <div className="col-sm col-sm-10 text-break">{formData.departmentName ?? formData.departmentId}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.FULLNAME}</label>
            <div className="col-sm col-sm-10 text-break">{formData.employeeName}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.FULLNAME_KANA}</label>
            <div className="col-sm col-sm-10 text-break">{formData.employeeNameKana}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.BIRTH_DATE}</label>
            <div className="col-sm col-sm-10 text-break">{formData.employeeBirthDate}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.EMAIL}</label>
            <div className="col-sm col-sm-10 text-break">{formData.employeeEmail}</div>
          </li>
          <li className="form-group row d-flex bor-none">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.TEL}</label>
            <div className="col-sm col-sm-10 text-break">{formData.employeeTelephone}</div>
          </li>

          {/* PHẦN 2: THÔNG TIN TRÌNH ĐỘ TIẾNG NHẬT (CHẾ ĐỘ XEM) */}
          <li className="title mt-12"><a href="#!">{SCREEN_TITLES.SECTION_JAPANESE_LEVEL}</a></li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.CERTIFICATION}</label>
            <div className="col-sm col-sm-10">{hasCertification ? (formData.certificationName ?? formData.certificationId ?? '') : ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.START_DATE}</label>
            <div className="col-sm col-sm-10">{hasCertification ? (formData.certificationStartDate || '') : ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.END_DATE}</label>
            <div className="col-sm col-sm-10">{hasCertification ? (formData.certificationEndDate || '') : ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">{FIELD_LABELS.SCORE}</label>
            <div className="col-sm col-sm-10">{hasCertification ? (formData.certificationScore || '') : ''}</div>
          </li>

          {/* PHẦN 3: NHÓM NÚT BẤM HÀNH ĐỘNG (XÁC NHẬN LƯU DB / QUAY LẠI) */}
          <li className="form-group row d-flex">
            <div className="btn-group col-sm col-sm-10 ml">
              <button type="button" onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm">{BUTTON_LABELS.OK}</button>
              <button type="button" onClick={handleBack} disabled={submitting} className="btn btn-secondary btn-sm">{BUTTON_LABELS.BACK}</button>
            </div>
          </li>
        </ul>
      </form>
    </div>
  );
}
