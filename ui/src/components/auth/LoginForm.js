'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
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
    <Card>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Your Account</h1>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Username field */}
            <div>
              <Input
                label="Username"
                {...register('username', { 
                  required: 'Username is required' 
                })}
                error={errors.username?.message}
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
            
            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
        
        {/* Registration link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Register here
            </a>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default LoginForm; 