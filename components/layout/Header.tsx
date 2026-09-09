import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';

/**
 * Component hiển thị thanh điều hướng đầu trang (Header) của ứng dụng.
 *
 * @return Giao diện Header
 */
const Header = () => {
  return (
    <nav className="nav-bar">
      <div className="content-main">
        <div className="d-flex">
          <a className="navbar-brand">
            <Image src="/assets/images/Logo-Luvina.svg" title="Logo" alt="logo" width={100} height={50} />
          </a>
          <h5 className="title-brand mr-auto">Luvina Software</h5>
          <ul className="navbar-nav flex-row d-flex">
            <li className="nav-item">
              <Link href={ROUTES.AUTH.LOGOUT}>ログアウト</Link>
            </li>
            <li className="nav-item">
              <Link href={ROUTES.EMPLOYEES.LIST}>トップ</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;

