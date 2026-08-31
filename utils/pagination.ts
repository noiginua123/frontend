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
): number[] {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set<number>();
  pages.add(1);
  if (currentPage - 1 >= 1) {
    pages.add(currentPage - 1);
  }
  pages.add(currentPage);
  if (currentPage + 1 <= totalPages) {
    pages.add(currentPage + 1);
  }
  pages.add(totalPages);

  return Array.from(pages).sort((firstPage, secondPage) => firstPage - secondPage);
}
