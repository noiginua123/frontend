/**
 * Tạo danh sách các trang hiển thị cho thanh phân trang.
 * Luôn bao gồm trang đầu, trang cuối, trang hiện tại và hai trang liền kề.
 *
 * @param currentPage Trang hiện tại
 * @param totalPages Tổng số trang
 * @return Danh sách số trang theo thứ tự tăng dần
 */
export function createVisiblePages(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1,
): number[] {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set<number>();
  pages.add(1);
  for (let i = currentPage - siblingCount; i <= currentPage + siblingCount; i++) {
    if (i >= 1 && i <= totalPages) {
      pages.add(i)
    }
  }
  pages.add(totalPages)

  return Array.from(pages).sort((firstPage, secondPage) => firstPage - secondPage);
}
