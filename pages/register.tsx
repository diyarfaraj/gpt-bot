// components/RegisterForm.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

type FormData = {
  username: string;
  password: string;
};

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [loading, setLoading] = useState<boolean>(false);

  const apiuri = process.env.NEXT_PUBLIC_CHATBOT_SERVER_URL;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiuri}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      alert('Registration successful');
    } catch (error) {
      alert('Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form">
      <h1>Register</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          Username:
          <input {...register('username', { required: true })} />
        </label>
        {errors.username && <span>This field is required</span>}
        <label>
          Password:
          <input
            {...register('password', { required: true })}
            type="password"
          />
        </label>
        {errors.password && <span>This field is required</span>}
        <input type="submit" value="Register" disabled={loading} />
        <Link href="/login">Already a member? Log in here.</Link>
      </form>

      <style jsx>{`
        .register-form {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: black;
          color: lime;
        }
        h1 {
          margin-bottom: 20px;
          font-family: 'Courier New', Courier, monospace;
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
        span {
          color: red;
          font-size: 0.8em;
        }
      `}</style>
    </div>
  );
}
