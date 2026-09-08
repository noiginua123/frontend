import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ADM003 from '@/components/employee/ADM003';
import { useADM003 } from '@/hooks/useADM003';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/hooks/useADM003');

const mockUseADM003 = useADM003 as jest.Mock;

describe('ADM003 Component', () => {
  const defaultHookValues = {
    employee: {
      code: 200,
      employeeId: 1,
      employeeLoginId: 'nguyenvana',
      employeeName: 'Nguyen Van A',
      employeeNameKana: 'グエン ヴァン アー',
      employeeBirthDate: '1990/01/01',
      employeeEmail: 'vana@example.com',
      employeeTelephone: '0901234567',
      departmentId: 2,
      departmentName: 'Phát triển phần mềm',
      certifications: [
        {
          certificationId: 1,
          certificationName: 'N1',
          startDate: '2022/01/01',
          endDate: '2024/01/01',
          score: 150,
        },
      ],
    },
    loading: false,
    isDeleting: false,
    errorMessage: null,
    isSystemError: false,
    fetchEmployeeById: jest.fn(),
    handleEdit: jest.fn(),
    handleDelete: jest.fn(),
    handleBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseADM003.mockReturnValue(defaultHookValues);
  });

  it('renders loading indicator when loading is true', () => {
    mockUseADM003.mockReturnValue({
      ...defaultHookValues,
      loading: true,
    });

    render(<ADM003 />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('renders SystemError component when isSystemError is true', () => {
    mockUseADM003.mockReturnValue({
      ...defaultHookValues,
      isSystemError: true,
      errorMessage: 'システムエラーが発生しました。',
    });

    render(<ADM003 />);
    expect(screen.getByText('システムエラーが発生しました。')).toBeInTheDocument();
  });

  it('renders error block with back button when employee is null and errorMessage exists', () => {
    const handleBack = jest.fn();
    mockUseADM003.mockReturnValue({
      ...defaultHookValues,
      employee: null,
      errorMessage: '該当するユーザは存在していません。',
      handleBack,
    });

    render(<ADM003 />);
    expect(screen.getByText('該当するユーザは存在していません。')).toBeInTheDocument();
    const backBtn = screen.getByRole('button', { name: '戻る' });
    expect(backBtn).toBeInTheDocument();

    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('renders employee detail information and certification correctly', () => {
    render(<ADM003 />);

    expect(screen.getByText('nguyenvana')).toBeInTheDocument();
    expect(screen.getByText('Phát triển phần mềm')).toBeInTheDocument();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('グエン ヴァン アー')).toBeInTheDocument();
    expect(screen.getByText('1990/01/01')).toBeInTheDocument();
    expect(screen.getByText('vana@example.com')).toBeInTheDocument();
    expect(screen.getByText('0901234567')).toBeInTheDocument();
    expect(screen.getByText('N1')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders inline error box when errorMessage exists while employee is loaded (e.g. ER020)', () => {
    mockUseADM003.mockReturnValue({
      ...defaultHookValues,
      errorMessage: '管理者ユーザを削除することはできません。',
    });

    render(<ADM003 />);
    expect(screen.getByText('管理者ユーザを削除することはできません。')).toBeInTheDocument();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
  });

  it('handles edit, delete, and back button clicks', () => {
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();
    const handleBack = jest.fn();

    mockUseADM003.mockReturnValue({
      ...defaultHookValues,
      handleEdit,
      handleDelete,
      handleBack,
    });

    render(<ADM003 />);

    fireEvent.click(screen.getByRole('button', { name: '編集' }));
    expect(handleEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '削除' }));
    expect(handleDelete).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '戻る' }));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isDeleting is true', () => {
    mockUseADM003.mockReturnValue({
      ...defaultHookValues,
      isDeleting: true,
    });

    render(<ADM003 />);

    expect(screen.getByRole('button', { name: '編集' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '削除' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '戻る' })).toBeDisabled();
  });
});
