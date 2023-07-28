// components/LoginForm.tsx

import { useState } from 'react';
import Link from 'next/link';

export default function LoginForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const apiuri = process.env.NEXT_PUBLIC_CHATBOT_SERVER_URL;

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiuri}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      alert('Login successful');
    } catch (error) {
      alert('Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <div className="login-form">
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
        <input type="submit" value="Login" disabled={loading} />
      </form>

      <style jsx>{`
        .login-form {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: black;
          color: lime;
        }
        form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        label {
          font-family: 'Courier New', Courier, monospace;
        }
        input[type='text'],
        input[type='password'] {
          background-color: black;
          border: none;
          border-bottom: 1px solid lime;
          color: lime;
          font-family: 'Courier New', Courier, monospace;
        }
        input[type='submit'] {
          margin-top: 10px;
          background-color: lime;
          border: none;
          color: black;
          padding: 5px 10px;
          cursor: pointer;
        }
        input[type='submit']:disabled {
          background-color: grey;
          cursor: not-allowed;
        }
      `}</style>
      <Link href="/register">Not a member? Register here.</Link>
    </div>
  );
}
