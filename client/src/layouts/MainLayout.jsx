import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  const { pathname, hash } = useLocation();
  // scroll to top on page change (but not when jumping to a #section)
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main"><Outlet /></main>
      <Footer />
    </>
  );
}
