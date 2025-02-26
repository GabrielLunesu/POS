'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

/**
 * Login form component
 * Handles user authentication
 */
const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  
  // Initialize react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Call login function from auth context
      const result = await login(data.username, data.password);
      
      if (result.success) {
        // Show success message
        toast.success('Login successful!');
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        // Show error message
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card 
      className="w-full max-w-md mx-auto"
      title="Login to POS System"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="username"
          label="Username"
          placeholder="Enter your username"
          required
          error={errors.username?.message}
          disabled={isLoading}
          {...register('username', { 
            required: 'Username is required' 
          })}
        />
        
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          required
          error={errors.password?.message}
          disabled={isLoading}
          {...register('password', { 
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />
        
        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default LoginForm; 