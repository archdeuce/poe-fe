import './Layout.style.scss';

import { ReactNode } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import ScrollToTop from '../ScrollToTop';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <Header />
      <div className="layout-content">{children}</div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Layout;
