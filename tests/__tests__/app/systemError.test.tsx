import React from 'react';
import { render, screen } from '@testing-library/react';
import SystemErrorPage from '@/app/systemError/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('SystemErrorPage', () => {
  it('renders system error message and OK button correctly', () => {
    render(<SystemErrorPage />);

    expect(screen.getByText('システムエラーが発生しました。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });
});
