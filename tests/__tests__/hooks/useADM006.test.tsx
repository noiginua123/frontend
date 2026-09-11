import { renderHook, act } from '@testing-library/react';
import { useADM006 } from '@/hooks/useADM006';
import { STORAGE_KEYS } from '@/constants/storage';
import { INFO_MESSAGES, MSG_CODE } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

describe('useADM006 hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
  });

  it('returns fallback message MSG001 when sessionStorage has no success message', () => {
    const { result } = renderHook(() => useADM006());

    expect(result.current.message).toBe(INFO_MESSAGES[MSG_CODE.MSG001]);
  });

  it('reads stored success message from sessionStorage and removes it immediately (flash message behavior)', () => {
    const customMessage = 'ユーザの更新が完了しました。';
    window.sessionStorage.setItem(STORAGE_KEYS.ADM006_SUCCESS_MESSAGE, customMessage);

    const { result } = renderHook(() => useADM006());

    expect(result.current.message).toBe(customMessage);
    // Key phải được dọn dẹp khỏi sessionStorage sau khi đọc
    expect(window.sessionStorage.getItem(STORAGE_KEYS.ADM006_SUCCESS_MESSAGE)).toBeNull();
  });

  it('navigates to employee list screen when handleOk is called', () => {
    const { result } = renderHook(() => useADM006());

    act(() => {
      result.current.handleOk();
    });

    expect(mockPush).toHaveBeenCalledWith(ROUTES.EMPLOYEES.LIST);
  });
});
