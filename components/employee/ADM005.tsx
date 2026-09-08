'use client';

import { useADM005 } from '@/hooks/useADM005';

/**
 * Màn hình xác nhận thông tin trước khi đăng ký nhân viên (ADM005).
 * Chỉ hiển thị (read-only) dữ liệu đã nhập ở ADM004.
 */
export default function ADM005() {
  const { formData, submitting, globalError, handleSubmit, handleBack } = useADM005();

  if (!formData) {
    return null;
  }

  const hasCertification = Boolean(formData.certificationId);

  return (
    <div className="row">
      <form className="c-form box-shadow">
        <ul className="show-data">
          <li className="title">
            <p>情報確認</p>
            <p>入力された情報をＯＫボタンクリックでＤＢへ保存してください</p>
          </li>
          {globalError && (
            <li className="box-err">
              <div className="box-err-content">{globalError}</div>
            </li>
          )}
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">アカウント名</label>
            <div className="col-sm col-sm-10">{formData.employeeLoginId}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">グループ</label>
            <div className="col-sm col-sm-10">{formData.departmentName ?? formData.departmentId}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">氏名</label>
            <div className="col-sm col-sm-10">{formData.employeeName}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">カタカナ氏名</label>
            <div className="col-sm col-sm-10">{formData.employeeNameKana}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">生年月日</label>
            <div className="col-sm col-sm-10">{formData.employeeBirthDate}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">メールアドレス</label>
            <div className="col-sm col-sm-10">{formData.employeeEmail}</div>
          </li>
          <li className="form-group row d-flex bor-none">
            <label className="col-form-label col-sm-2">電話番号</label>
            <div className="col-sm col-sm-10">{formData.employeeTelephone}</div>
          </li>
          <li className="title mt-12"><a href="#!">日本語能力</a></li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">資格</label>
            <div className="col-sm col-sm-10">{hasCertification ? (formData.certificationName ?? formData.certificationId ?? '') : ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">資格交付日</label>
            <div className="col-sm col-sm-10">{hasCertification ? (formData.certificationStartDate || '') : ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">失効日</label>
            <div className="col-sm col-sm-10">{hasCertification ? (formData.certificationEndDate || '') : ''}</div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">点数</label>
            <div className="col-sm col-sm-10">{hasCertification ? (formData.certificationScore || '') : ''}</div>
          </li>
          <li className="form-group row d-flex">
            <div className="btn-group col-sm col-sm-10 ml">
              <button type="button" onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-sm">OK</button>
              <button type="button" onClick={handleBack} disabled={submitting} className="btn btn-secondary btn-sm">戻る</button>
            </div>
          </li>
        </ul>
      </form>
    </div>
  );
}
