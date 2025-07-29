import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Router from 'next/router';
import Logout from '@/components/Logout';
import styles from '@/styles/Navbar.module.css';

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
    <nav className={styles.navbar}>
      <div className={styles.logoSection}>
        <span className={styles.logoIcon}>📝</span>
        <span className={styles.logoText}>ResuMatch</span>
      </div>
      <div className={styles.links} suppressHydrationWarning>
        {loggedIn ? (
          <>
            <Link href="/match" className={styles.signupBtn}>Analyze Now</Link>
            <Link href="/history" className={styles.signupBtn}>Match History</Link>
            <Logout />
          </>
        ) : (
          <>
            <Link href="/login" className={styles.link}>Login</Link>
            <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}