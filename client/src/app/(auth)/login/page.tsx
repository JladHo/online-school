'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { Terminal, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await apiClient.post('/users/login', {
        email,
        password
      });
      
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setStatus('error');
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'Неверный email или пароль.');
      } else {
        setErrorMessage('Произошла ошибка при авторизации. Попробуйте еще раз.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Вернуться на главную
        </Link>
        
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 p-8 text-center">
            <div className="inline-flex items-center justify-center space-x-2 text-white mb-2">
              <Terminal size={28} strokeWidth={2.5} className="text-blue-500" />
              <span className="font-bold text-2xl tracking-tight">CodeSchool</span>
            </div>
            <p className="text-gray-400 text-sm">Вход в личный кабинет</p>
          </div>
          
          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  placeholder="admin@example.com"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  required 
                />
              </div>
              
              {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                  {errorMessage}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md disabled:bg-blue-400 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Вход...
                  </>
                ) : (
                  'Войти в систему'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
