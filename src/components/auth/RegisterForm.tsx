'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import React, { useState } from 'react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { RegisterCredentials } from '@/types';
import Textarea from '@/components/ui/Textarea';
import { useAuth } from '@/hooks/useAuth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: '',
    username: '',
    displayName: '',
    password: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterCredentials>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterCredentials> = {};

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!credentials.username) {
      newErrors.username = 'Username is required';
    } else if (credentials.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(credentials.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!credentials.displayName) {
      newErrors.displayName = 'Display name is required';
    } else if (credentials.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await register(credentials);
      
      if (result.success) {
        onSuccess?.();
      } else {
        setErrors({ email: result.error || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ email: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterCredentials) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Join Bailanysta</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Create your account to get started
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={credentials.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            disabled={isLoading}
          />
          
          <Input
            type="text"
            label="Username"
            placeholder="Choose a username"
            value={credentials.username}
            onChange={handleInputChange('username')}
            error={errors.username}
            disabled={isLoading}
          />
          
          <Input
            type="text"
            label="Display Name"
            placeholder="Your display name"
            value={credentials.displayName}
            onChange={handleInputChange('displayName')}
            error={errors.displayName}
            disabled={isLoading}
          />
          
          <Textarea
            label="Bio (Optional)"
            placeholder="Tell us about yourself..."
            value={credentials.bio}
            onChange={handleInputChange('bio')}
            error={errors.bio}
            disabled={isLoading}
            rows={3}
          />
          
          <Input
            type="password"
            label="Password"
            placeholder="Create a password"
            value={credentials.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Create Account
          </Button>
          
          {onSwitchToLogin && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-blue-600 hover:underline"
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
