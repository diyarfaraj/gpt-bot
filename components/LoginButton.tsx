// components/LoginButton.tsx

import { useState } from 'react';

export default function LoginButton() {
  const [loading, setLoading] = useState<boolean>(false);
  const [showLoginForm, setShowLoginForm] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const apiuri = process.env.NEXT_PUBLIC_CHATBOT_SERVER_URL;

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiuri}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
        credentials: 'include', // include, *same-origin, omit
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      console.log('Login successful');
      alert('Login successful');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Failed to login');
    } finally {
      setLoading(false);
      setShowLoginForm(false);
    }
  };

  const handleShowLoginForm = () => {
    setShowLoginForm(true);
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <>
      {showLoginForm ? (
        <form onSubmit={handleLogin}>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={username}
              onChange={handleUsernameChange}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>
      ) : (
        <button onClick={handleShowLoginForm} disabled={loading}>
          Login
        </button>
      )}
    </>
  );
}
