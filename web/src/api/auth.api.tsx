import api from '@/lib/api';
import type { RegisterSchemaType } from 'shared';
import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai/react';
import { authAtom } from '@/lib/store';
import { toast } from 'sonner';

export function useRegister() {
  return useMutation({
    mutationKey: ['register'],
    mutationFn: async (data: RegisterSchemaType) => {
      const response = await api.register.$post({
        json: data,
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      return await response.json();
    },
    onMutate: data => {
      toast.loading('Registering...', { id: data.email });
    },
    onSuccess: (_data, variables) => {
      toast.success(`Registration successful for ${variables.email}`, {
        id: variables.email,
      });
    },
    onError: (error, variables) => {
      toast.error(
        `Registration failed for ${variables.email}: ${error.message}`,
        {
          id: variables.email,
        }
      );
    },
  });
}

export function useLogin() {
  const [, setAuth] = useAtom(authAtom);
  return useMutation({
    mutationKey: ['login'],
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.login.$post({
        json: data,
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      return await response.json();
    },
    onMutate: data => {
      toast.loading('Logging in...', { id: data.email });
    },
    onSuccess: (data, variables) => {
      toast.success(`Login successful for ${variables.email}`, {
        id: variables.email,
      });

      const { user, token } = data.data;
      setAuth({
        token: token,
        user: {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
        },
      });
    },
    onError: (error, variables) => {
      toast.error(`Login failed for ${variables.email}: ${error.message}`, {
        id: variables.email,
      });
    },
  });
}
