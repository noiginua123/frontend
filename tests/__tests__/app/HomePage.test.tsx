import { render } from '@testing-library/react';
import HomePage from '@/app/page';
import { getToken, isTokenExpired } from '@/lib/auth/token';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

jest.mock('@/lib/auth/token');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockReplace = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
  replace: mockReplace,
});

const mockedGetToken = getToken as jest.Mock;
const mockedIsTokenExpired = isTokenExpired as jest.Mock;

describe('HomePage Component (Root Redirect)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to /login when no token is found', () => {
    mockedGetToken.mockReturnValue(null);

    render(<HomePage />);

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTH.LOGIN);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it('redirects to /login when token is found but expired', () => {
    mockedGetToken.mockReturnValue({ accessToken: 'expired-token', tokenType: 'Bearer' });
    mockedIsTokenExpired.mockReturnValue(true);

    render(<HomePage />);

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTH.LOGIN);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it('redirects to /employees/adm002 when token is valid and not expired', () => {
    mockedGetToken.mockReturnValue({ accessToken: 'valid-token', tokenType: 'Bearer' });
    mockedIsTokenExpired.mockReturnValue(false);

    render(<HomePage />);

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.EMPLOYEES.LIST);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});
