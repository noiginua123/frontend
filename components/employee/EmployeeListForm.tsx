'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DepartmentDTO } from '@/types/employee';

interface EmployeeListFormProps {
  departments: DepartmentDTO[];
  onSearch: (filter: { fullname: string; departmentId: string }) => void;
  initialFullname?: string;
  initialDepartmentId?: string;
}

export const EmployeeListForm: React.FC<EmployeeListFormProps> = ({
  departments,
  onSearch,
  initialFullname = '',
  initialDepartmentId = '',
}) => {
  const router = useRouter();
  const [fullname, setFullname] = useState<string>(initialFullname);
  const [departmentId, setDepartmentId] = useState<string>(initialDepartmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ fullname, departmentId });
  };

  return (
    <div className="search-memb">
      <h1 className="title">会員名称で会員を検索します。検索条件無しの場合は全て表示されます。</h1>
      <form className="c-form" onSubmit={handleSubmit}>
        <ul className="d-flex">
          <li className="form-group row">
            <label className="col-form-label">氏名:</label>
            <div className="col-sm">
              <input
                type="text"
                maxLength={125}
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
          </li>
          <li className="form-group row">
            <label className="col-form-label">グループ:</label>
            <div className="col-sm">
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">全て</option>
                {departments.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
          </li>
          <li className="form-group row">
            <div className="btn-group">
              <button type="submit" className="btn btn-primary btn-sm">
                検索
              </button>
              <button
                type="button"
                onClick={() => router.push('/employees/adm004')}
                className="btn btn-secondary btn-sm"
              >
                新規追加
              </button>
            </div>
          </li>
        </ul>
      </form>
    </div>
  );
};
