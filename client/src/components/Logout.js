import { useRouter } from 'next/router';

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
    <button onClick={handleLogout} className="btn btn-primary btn-sm px-3 py-1">
      Logout
    </button>
  );
}