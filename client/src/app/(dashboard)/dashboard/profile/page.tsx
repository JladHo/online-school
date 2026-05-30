'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { User, Mail, Phone, Calendar, Shield, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    studentName: '',
    parentName: '',
    email: '',
    phone: '',
    birthday: '',
    password: '' // Optional for changing
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        studentName: user.studentName || '',
        parentName: user.parentName || '',
        email: user.email || '',
        phone: user.phone || '',
        birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
        password: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload: any = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }

      const res = await apiClient.patch(`/users/${user.id}`, payload);
      
      // Update local storage/store with new user data
      const token = localStorage.getItem('token') || '';
      setAuth(res.data, token);
      
      setSuccessMsg('Профиль успешно обновлен!');
      setFormData(prev => ({ ...prev, password: '' })); // clear password field
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
		<div className='space-y-6'>
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4'>
				<div>
					<h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
						<User className='text-indigo-500' /> Профиль пользователя
					</h1>
					<p className='text-gray-500 text-sm mt-1'>
						Личные данные и настройки аккаунта
					</p>
				</div>
				<div className='flex items-center gap-3'>
					<span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-100'>
						<Shield size={16} />
						{user.role === 'admin'
							? 'Администратор'
							: user.role === 'manager'
								? 'Менеджер'
								: user.role === 'teacher'
									? 'Преподаватель'
									: 'Ученик'}
					</span>
				</div>
			</div>

			<div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
				<form onSubmit={handleSubmit} className='p-6 md:p-8 space-y-6'>
					<div className='flex items-center gap-4 border-b border-gray-100 pb-6 mb-6'>
						<div className='w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold'>
							{(user.fullName || user.studentName || user.email)
								.charAt(0)
								.toUpperCase()}
						</div>
						<div>
							<h2 className='text-xl font-bold text-gray-900'>
								{user.fullName || user.studentName || 'Ваш профиль'}
							</h2>
							<p className='text-sm text-gray-500'>{user.email}</p>
						</div>
					</div>

					{successMsg && (
						<div className='bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 font-medium'>
							{successMsg}
						</div>
					)}
					{errorMsg && (
						<div className='bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium'>
							{errorMsg}
						</div>
					)}
					{user.role === 'user' && (
						<>
							{/* <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mt-8 mb-6">Дополнительно (Для учеников)</h2> */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
										<User size={16} className='text-gray-400' />
										ФИО ученика
									</label>
									<input
										type='text'
										value={formData.studentName}
										onChange={e =>
											setFormData({ ...formData, studentName: e.target.value })
										}
										className='w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
										<User size={16} className='text-gray-400' />
										ФИО Родителя
									</label>
									<input
										type='text'
										value={formData.parentName}
										onChange={e =>
											setFormData({ ...formData, parentName: e.target.value })
										}
										className='w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow'
									/>
								</div>
							</div>
						</>
					)}

					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{user.role !== 'user' && (
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
									<User size={16} className='text-gray-400' />
									ФИО (Полное имя)
								</label>
								<input
									type='text'
									value={formData.fullName}
									onChange={e =>
										setFormData({ ...formData, fullName: e.target.value })
									}
									className='w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow'
								/>
							</div>
						)}

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
								<Phone size={16} className='text-gray-400' />
								Номер телефона
							</label>
							<input
								type='text'
								value={formData.phone}
								onChange={e =>
									setFormData({ ...formData, phone: e.target.value })
								}
								className='w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
								<Mail size={16} className='text-gray-400' />
								Email (Логин)
							</label>
							<input
								type='email'
								value={formData.email}
								onChange={e =>
									setFormData({ ...formData, email: e.target.value })
								}
								className='w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-gray-50'
								readOnly
								title='Email нельзя изменить'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
								<Calendar size={16} className='text-gray-400' />
								Дата рождения
							</label>
							<input
								type='date'
								value={formData.birthday}
								onChange={e =>
									setFormData({ ...formData, birthday: e.target.value })
								}
								className='w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
								<Shield size={16} className='text-gray-400' />
								Новый пароль
							</label>
							<input
								type='password'
								value={formData.password}
								onChange={e =>
									setFormData({ ...formData, password: e.target.value })
								}
								className='w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow'
								placeholder='Оставьте пустым, чтобы не менять'
							/>
						</div>
					</div>

					<div className='flex justify-end pt-6 border-t border-gray-100 mt-8'>
						<button
							type='submit'
							disabled={loading}
							className='bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-sm'
						>
							<Save size={18} />
							{loading ? 'Сохранение...' : 'Сохранить изменения'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
