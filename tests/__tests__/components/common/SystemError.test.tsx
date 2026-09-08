import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SystemError from '@/components/common/SystemError';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SystemError Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders default system error message and OK button', () => {
    render(<SystemError />);

    expect(screen.getByText('システムエラーが発生しました。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });

  it('renders custom message and button label', () => {
    render(
      <SystemError
        message="サーバーとの通信に失敗しました。"
        buttonLabel="戻る"
      />
    );

    expect(screen.getByText('サーバーとの通信に失敗しました。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument();
  });

  it('calls onAction callback when clicked if provided', () => {
    const handleAction = jest.fn();
    render(<SystemError onAction={handleAction} />);

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to ADM002 list by default when onAction is omitted', () => {
    render(<SystemError />);

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(mockPush).toHaveBeenCalledWith('/employees/adm002');
  });
});
