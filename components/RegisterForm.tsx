// components/RegisterForm.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';

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

      const responseData = await response.json();

      console.log(responseData);
      alert('Registration successful');
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Username:</label>
        <input {...register('username')} required />
      </div>
      <div>
        <label>Password:</label>
        <input {...register('password')} type="password" required />
      </div>
      <div>
        <button type="submit">Register</button>
      </div>
    </form>
  );
}
