'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
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
      const result = await registerUser(data.username, data.email, data.password);
      
      toast.success('Registration successful! Please log in.');
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Registration failed');
      } else {
        toast.error('An error occurred during registration');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Username field */}
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
            
            {/* Email field */}
            <div>
              <Input
                type="email"
                label="Email"
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
            
            {/* Password field */}
            <div>
              <Input
                type="password"
                label="Password"
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
            
            {/* Confirm Password field */}
            <div>
              <Input
                type="password"
                label="Confirm Password"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => 
                    value === password || 'Passwords do not match'
                })}
                error={errors.confirmPassword?.message}
              />
            </div>
            
            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </form>
        
        {/* Login link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
} 