'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

/**
 * Registration form component
 * Handles user registration with form validation
 */
export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  
  const password = watch('password');
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      await registerUser(data.username, data.email, data.password);
      toast.success('Registration successful! Please log in.');
      router.push('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Create an Account</h1>
        <p className="text-gray-600 mt-2">Sign up to access the POS system</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Username"
            {...register('username', { 
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
              }
            })}
            error={errors.username?.message}
          />
        </div>
        
        <div>
          <Input
            label="Email"
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={errors.email?.message}
          />
        </div>
        
        <div>
          <Input
            label="Password"
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            error={errors.password?.message}
          />
        </div>
        
        <div>
          <Input
            label="Confirm Password"
            type="password"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
            error={errors.confirmPassword?.message}
          />
        </div>
        
        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Register
        </Button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </Card>
  );
} 