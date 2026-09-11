import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import ADM004 from '@/components/employee/ADM004';
import { useADM004 } from '@/hooks/useADM004';
import type { EmployeeFormData } from '@/lib/validation/validateEmployeeForm';

jest.mock('@/hooks/useADM004');

const mockUseADM004 = useADM004 as jest.Mock;

function TestWrapper({ isEdit = false }: { isEdit?: boolean }) {
  const form = useForm<EmployeeFormData>({
    defaultValues: {
      employeeLoginId: isEdit ? 'existing_user' : '',
      departmentId: '1',
      employeeName: 'Nguyễn Văn A',
      employeeNameKana: 'ｱｲｳ',
      employeeBirthDate: '1995/01/01',
      employeeEmail: 'test@example.com',
      employeeTelephone: '0123456789',
      employeeLoginPassword: '',
      employeeLoginPasswordConfirm: '',
      certificationId: '',
      certificationStartDate: '',
      certificationEndDate: '',
      certificationScore: '',
    },
  });

  mockUseADM004.mockReturnValue({
    form,
    departments: [{ departmentId: 1, departmentName: 'Phòng Phát Triển' }],
    certifications: [{ certificationId: 1, certificationName: 'N1' }],
    globalError: '',
    isCertificationSelected: false,
    isEdit,
    mode: isEdit ? 'edit' : 'add',
    handleCertificationChange: jest.fn(),
    handleCertificationStartDateChange: jest.fn(),
    handleConfirm: jest.fn((e) => e.preventDefault()),
    handleBack: jest.fn(),
  });

  return <ADM004 />;
}

describe('ADM004 Component - employeeLoginId behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('in Add mode: enables employeeLoginId and displays red required asterisk', () => {
    const { container } = render(<TestWrapper isEdit={false} />);

    expect(screen.getByText('会員情報登録')).toBeInTheDocument();

    const loginInput = container.querySelector('#employeeLoginId') as HTMLInputElement;
    expect(loginInput).toBeInTheDocument();
    expect(loginInput.id).toBe('employeeLoginId');
    expect(loginInput).not.toBeDisabled();
    expect(loginInput.readOnly).toBe(false);

    // Label contains required asterisk *
    const label = screen.getByText(/アカウント名:/);
    expect(label.querySelector('.note-red')).not.toBeNull();
  });

  it('in Edit mode: disables employeeLoginId, sets readOnly, and hides red asterisk', () => {
    const { container } = render(<TestWrapper isEdit={true} />);

    expect(screen.getByText('会員情報編集')).toBeInTheDocument();

    const loginInput = container.querySelector('#employeeLoginId') as HTMLInputElement;
    expect(loginInput).toBeInTheDocument();
    expect(loginInput.id).toBe('employeeLoginId');
    expect(loginInput.value).toBe('existing_user');
    expect(loginInput).toBeDisabled();
    expect(loginInput.readOnly).toBe(true);

    // Label does NOT contain required asterisk *
    const label = screen.getByText(/アカウント名:/);
    expect(label.querySelector('.note-red')).toBeNull();
  });
});
