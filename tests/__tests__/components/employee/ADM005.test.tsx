import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ADM005 from '@/components/employee/ADM005';
import { useADM005 } from '@/hooks/useADM005';

jest.mock('@/hooks/useADM005');

const mockUseADM005 = useADM005 as jest.Mock;

describe('ADM005 Component', () => {
  const longName125 = 'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww125';

  const defaultHookValues = {
    formData: {
      employeeLoginId: 'test_login',
      departmentId: '1',
      departmentName: 'Phòng Phát Triển',
      employeeName: longName125,
      employeeNameKana: 'ｶﾀｶﾅ',
      employeeBirthDate: '1995/05/10',
      employeeEmail: 'test@example.com',
      employeeTelephone: '0123456789',
      employeeLoginPassword: 'password123',
      employeeLoginPasswordConfirm: 'password123',
      certificationId: '1',
      certificationName: 'N1',
      certificationStartDate: '2023/01/01',
      certificationEndDate: '2025/01/01',
      certificationScore: '170',
      mode: 'add' as const,
    },
    submitting: false,
    globalError: '',
    handleSubmit: jest.fn(),
    handleBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseADM005.mockReturnValue(defaultHookValues);
  });

  it('renders formData with text-break class so long names (125 chars) wrap properly', () => {
    render(<ADM005 />);

    expect(screen.getByText('情報確認')).toBeInTheDocument();

    const nameDiv = screen.getByText(longName125);
    expect(nameDiv).toBeInTheDocument();
    expect(nameDiv).toHaveClass('text-break');

    // Các trường khác cũng có text-break
    const loginDiv = screen.getByText('test_login');
    expect(loginDiv).toHaveClass('text-break');
  });

  it('triggers handleSubmit when clicking OK button and handleBack when clicking 戻る button', () => {
    render(<ADM005 />);

    const okButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.click(okButton);
    expect(defaultHookValues.handleSubmit).toHaveBeenCalledTimes(1);

    const backButton = screen.getByRole('button', { name: '戻る' });
    fireEvent.click(backButton);
    expect(defaultHookValues.handleBack).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when submitting is true', () => {
    mockUseADM005.mockReturnValue({
      ...defaultHookValues,
      submitting: true,
    });

    render(<ADM005 />);

    const okButton = screen.getByRole('button', { name: 'OK' });
    const backButton = screen.getByRole('button', { name: '戻る' });

    expect(okButton).toBeDisabled();
    expect(backButton).toBeDisabled();
  });
});
