'use client';

import { Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse } from 'date-fns';

import { useADM004 } from '@/hooks/useADM004';

import type { EmployeeCreateFormData } from '@/lib/validation/employeeCreate';

/**
 * Chuyển chuỗi yyyy/MM/dd sang Date cho DatePicker (null nếu rỗng/không hợp lệ).
 */
const parseDateValue = (value: string): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = parse(value, 'yyyy/MM/dd', new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Chặn gõ phím trực tiếp vào ô DatePicker (chỉ cho phép phím Tab để điều hướng),
 * đảm bảo người dùng chỉ chọn ngày từ popup lịch theo đúng thiết kế.
 */
const handleDatePickerKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key !== 'Tab') {
    e.preventDefault();
  }
};

/**
 * Form nhập liệu thêm mới nhân viên (ADM004). Kết nối với hook useADM004.
 */
export default function ADM004() {
  const { form, departments, certifications, globalError, isCertificationSelected, onConfirm, onBack } = useADM004();
  const {
    register,
    control,
    clearErrors,
    formState: { errors },
  } = form;

  /**
   * Xóa lỗi của trường khi người dùng focus vào ô nhập liệu,
   * chỉ kiểm tra và báo đỏ trở lại khi người dùng out focus (blur).
   */
  const handleFocus = (fieldName: keyof EmployeeCreateFormData) => {
    clearErrors(fieldName);
  };

  return (
    <div className="row">
      <form className="c-form box-shadow" onSubmit={onConfirm} noValidate>
        <ul>
          <li className="title">会員情報登録</li>
          {globalError && (
            <li className="box-err">
              <div className="box-err-content">{globalError}</div>
            </li>
          )}
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">アカウント名:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input
                type="text"
                className={`form-control ${errors.employeeLoginId ? 'is-invalid' : ''}`}
                {...register('employeeLoginId')}
                onFocus={() => handleFocus('employeeLoginId')}
              />
              {errors.employeeLoginId && (
                <div className="invalid-feedback d-block">{errors.employeeLoginId.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">グループ:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <select
                className={`form-control ${errors.departmentId ? 'is-invalid' : ''}`}
                {...register('departmentId')}
                onFocus={() => handleFocus('departmentId')}
              >
                <option value="">選択してください</option>
                {departments.map((department) => (
                  <option key={department.departmentId} value={String(department.departmentId)}>
                    {department.departmentName}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <div className="invalid-feedback d-block">{errors.departmentId.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">氏名:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input
                type="text"
                className={`form-control ${errors.employeeName ? 'is-invalid' : ''}`}
                {...register('employeeName')}
                onFocus={() => handleFocus('employeeName')}
              />
              {errors.employeeName && (
                <div className="invalid-feedback d-block">{errors.employeeName.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">カタカナ氏名:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input
                type="text"
                className={`form-control ${errors.employeeNameKana ? 'is-invalid' : ''}`}
                {...register('employeeNameKana')}
                onFocus={() => handleFocus('employeeNameKana')}
              />
              {errors.employeeNameKana && (
                <div className="invalid-feedback d-block">{errors.employeeNameKana.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">生年月日:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <div className="datepicker-wrapper">
                <Controller
                  control={control}
                  name="employeeBirthDate"
                  render={({ field }) => (
                    <DatePicker
                      placeholderText="yyyy/MM/dd"
                      className={`form-control ${errors.employeeBirthDate ? 'is-invalid' : ''}`}
                      selected={parseDateValue(field.value)}
                      onChange={(date: Date | null) => field.onChange(date ? format(date, 'yyyy/MM/dd') : '')}
                      onFocus={() => handleFocus('employeeBirthDate')}
                      onBlur={field.onBlur}
                      dateFormat="yyyy/MM/dd"
                      onKeyDown={handleDatePickerKeyDown}
                      onChangeRaw={(e) => e?.preventDefault()}
                    />
                  )}
                />
                <span className="glyphicon glyphicon-calendar"></span>
              </div>
              {errors.employeeBirthDate && (
                <div className="invalid-feedback d-block">{errors.employeeBirthDate.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">メールアドレス:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input
                type="text"
                className={`form-control ${errors.employeeEmail ? 'is-invalid' : ''}`}
                {...register('employeeEmail')}
                onFocus={() => handleFocus('employeeEmail')}
              />
              {errors.employeeEmail && (
                <div className="invalid-feedback d-block">{errors.employeeEmail.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">電話番号:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input
                type="text"
                className={`form-control ${errors.employeeTelephone ? 'is-invalid' : ''}`}
                {...register('employeeTelephone')}
                onFocus={() => handleFocus('employeeTelephone')}
              />
              {errors.employeeTelephone && (
                <div className="invalid-feedback d-block">{errors.employeeTelephone.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">パスワード:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input
                type="password"
                className={`form-control ${errors.employeeLoginPassword ? 'is-invalid' : ''}`}
                autoComplete="new-password"
                {...register('employeeLoginPassword')}
                onFocus={() => handleFocus('employeeLoginPassword')}
              />
              {errors.employeeLoginPassword && (
                <div className="invalid-feedback d-block">{errors.employeeLoginPassword.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">パスワード（確認）:<span className="note-red">*</span></i></label>
            <div className="col-sm col-sm-10">
              <input
                type="password"
                className={`form-control ${errors.employeeLoginPasswordConfirm ? 'is-invalid' : ''}`}
                autoComplete="new-password"
                {...register('employeeLoginPasswordConfirm')}
                onFocus={() => handleFocus('employeeLoginPasswordConfirm')}
              />
              {errors.employeeLoginPasswordConfirm && (
                <div className="invalid-feedback d-block">{errors.employeeLoginPasswordConfirm.message}</div>
              )}
            </div>
          </li>
          <li className="title mt-12"><a href="#!">日本語能力</a></li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2"><i className="relative">資格:</i></label>
            <div className="col-sm col-sm-10">
              <select
                className={`form-control ${errors.certificationId ? 'is-invalid' : ''}`}
                {...register('certificationId')}
                onFocus={() => handleFocus('certificationId')}
              >
                <option value="">選択してください</option>
                {certifications.map((certification) => (
                  <option key={certification.certificationId} value={String(certification.certificationId)}>
                    {certification.certificationName}
                  </option>
                ))}
              </select>
              {errors.certificationId && (
                <div className="invalid-feedback d-block">{errors.certificationId.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">
              <i className="relative">
                資格交付日:
                {isCertificationSelected && <span className="note-red">*</span>}
              </i>
            </label>
            <div className="col-sm col-sm-10">
              <div className={`datepicker-wrapper ${!isCertificationSelected ? 'disabled' : ''}`}>
                <Controller
                  control={control}
                  name="certificationStartDate"
                  render={({ field }) => (
                    <DatePicker
                      placeholderText="yyyy/MM/dd"
                      className={`form-control ${errors.certificationStartDate ? 'is-invalid' : ''}`}
                      selected={parseDateValue(field.value)}
                      onChange={(date: Date | null) => field.onChange(date ? format(date, 'yyyy/MM/dd') : '')}
                      onFocus={() => handleFocus('certificationStartDate')}
                      onBlur={field.onBlur}
                      dateFormat="yyyy/MM/dd"
                      onKeyDown={handleDatePickerKeyDown}
                      onChangeRaw={(e) => e?.preventDefault()}
                      disabled={!isCertificationSelected}
                    />
                  )}
                />
                <span className="glyphicon glyphicon-calendar"></span>
              </div>
              {errors.certificationStartDate && (
                <div className="invalid-feedback d-block">{errors.certificationStartDate.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">
              <i className="relative">
                失効日:
                {isCertificationSelected && <span className="note-red">*</span>}
              </i>
            </label>
            <div className="col-sm col-sm-10">
              <div className={`datepicker-wrapper ${!isCertificationSelected ? 'disabled' : ''}`}>
                <Controller
                  control={control}
                  name="certificationEndDate"
                  render={({ field }) => (
                    <DatePicker
                      placeholderText="yyyy/MM/dd"
                      className={`form-control ${errors.certificationEndDate ? 'is-invalid' : ''}`}
                      selected={parseDateValue(field.value)}
                      onChange={(date: Date | null) => field.onChange(date ? format(date, 'yyyy/MM/dd') : '')}
                      onFocus={() => handleFocus('certificationEndDate')}
                      onBlur={field.onBlur}
                      dateFormat="yyyy/MM/dd"
                      onKeyDown={handleDatePickerKeyDown}
                      onChangeRaw={(e) => e?.preventDefault()}
                      disabled={!isCertificationSelected}
                    />
                  )}
                />
                <span className="glyphicon glyphicon-calendar"></span>
              </div>
              {errors.certificationEndDate && (
                <div className="invalid-feedback d-block">{errors.certificationEndDate.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <label className="col-form-label col-sm-2">
              <i className="relative">
                点数:
                {isCertificationSelected && <span className="note-red">*</span>}
              </i>
            </label>
            <div className="col-sm col-sm-10">
              <input
                type="text"
                className={`form-control ${errors.certificationScore ? 'is-invalid' : ''}`}
                {...register('certificationScore')}
                onFocus={() => handleFocus('certificationScore')}
                disabled={!isCertificationSelected}
              />
              {errors.certificationScore && (
                <div className="invalid-feedback d-block">{errors.certificationScore.message}</div>
              )}
            </div>
          </li>
          <li className="form-group row d-flex">
            <div className="btn-group col-sm col-sm-10 ml">
              <button type="submit" className="btn btn-primary btn-sm">確認</button>
              <button type="button" onClick={onBack} className="btn btn-secondary btn-sm">戻る</button>
            </div>
          </li>
        </ul>
      </form>
    </div>
  );
}
