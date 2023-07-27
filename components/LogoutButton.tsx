// components/LogoutButton.tsx

import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState<boolean>(false);
  const apiuri = process.env.NEXT_PUBLIC_CHATBOT_SERVER_URL;

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiuri}/logout`, {
        method: 'GET',
        credentials: 'include', // include, *same-origin, omit
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      console.log('Logout successful');
      alert('Logout successful');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLogout} disabled={loading}>
      Logout
    </button>
  );
}
