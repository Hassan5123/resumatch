import { useRouter } from 'next/router';
import styles from '@/styles/Navbar.module.css';

export default function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Simply clear local token; backend validation handled with token expiry
    } finally {
      // Remove auth token then redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      router.push('/login');
    }
  };

  return (
    <button onClick={handleLogout} className={styles.signupBtn}>
      Logout
    </button>
  );
}