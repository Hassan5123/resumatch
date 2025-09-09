import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Router from 'next/router';
import Logout from '@/components/Logout';

export default function Navbar() {
  // Start as logged out; update after mount to avoid SSR/CSR markup mismatch
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  // Check auth token on mount and whenever route changes or localStorage updates
  useEffect(() => {
    const checkToken = () => {
      if (typeof window !== 'undefined') {
        setLoggedIn(!!localStorage.getItem('token'));
      }
    };

    checkToken(); // initial

    Router.events.on('routeChangeComplete', checkToken);
    window.addEventListener('storage', checkToken);

    return () => {
      Router.events.off('routeChangeComplete', checkToken);
      window.removeEventListener('storage', checkToken);
    };
  }, []);
  
  return (
    <nav className="d-flex justify-content-between align-items-center py-3 px-4 bg-white" style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
      <Link href="/" className="d-flex align-items-center text-decoration-none">
        <span className="fs-4 me-2">📝</span>
        <span className="fw-semibold fs-5 text-dark">ResuMatch</span>
      </Link>
      <div className="d-flex align-items-center gap-3" suppressHydrationWarning>
        {loggedIn ? (
          <>
            <Link href="/match" className="btn btn-primary btn-sm px-3 py-1">Analyze Now</Link>
            <Link href="/history" className="btn btn-primary btn-sm px-3 py-1">Match History</Link>
            <Logout />
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-primary btn-sm px-3 py-1">Login</Link>
            <Link href="/signup" className="btn btn-primary btn-sm px-3 py-1">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}