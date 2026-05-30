'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Users, Edit2, Trash2, Plus, X, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    role: 'user',
    fullName: '',
    studentName: '',
    parentName: '',
    birthday: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        password: '', // Пароль пустой при редактировании
        role: user.role || 'user',
        fullName: user.fullName || '',
        studentName: user.studentName || '',
        parentName: user.parentName || '',
        birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        phone: '',
        password: '',
        role: 'user',
        fullName: '',
        studentName: '',
        parentName: '',
        birthday: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload: any = { ...formData };
      if (!payload.password && editingUser) {
        delete payload.password; // Не обновлять пароль, если пустой
      }

      if (editingUser) {
        await apiClient.patch(`/admin/users/${editingUser.id}`, payload);
      } else {
        if (!payload.password) {
          alert('Пароль обязателен для нового пользователя');
          return;
        }
        await apiClient.post('/admin/users', payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await apiClient.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch {
        alert('Ошибка при удалении');
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Админ</span>;
      case 'manager': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Менеджер</span>;
      case 'teacher': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Преподаватель</span>;
      case 'user': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Ученик</span>;
      default: return <span>{role}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (u.fullName || '').toLowerCase().includes(searchLower) ||
      (u.studentName || '').toLowerCase().includes(searchLower) ||
      (u.email || '').toLowerCase().includes(searchLower) ||
      (u.phone || '').toLowerCase().includes(searchLower) ||
      (u.role || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Users className="text-indigo-500"/> Управление пользователями</h1>
          <p className="text-gray-500 text-sm mt-1">Создание, редактирование и удаление аккаунтов (Полный доступ)</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Поиск пользователей..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition whitespace-nowrap"
          >
            <Plus size={16} /> Добавить
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Роль</th>
                <th className="px-6 py-4">Имя / Ученик</th>
                <th className="px-6 py-4">Контакты</th>
                <th className="px-6 py-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Пользователи не найдены.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-500">#{u.id}</td>
                  <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{u.fullName || u.studentName || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <p>{u.email}</p>
                    <p className="text-xs">{u.phone}</p>
                  </td>
                  <td className="px-6 py-4 flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(u)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Редактировать">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Удалить">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="user">Ученик (user)</option>
                    <option value="teacher">Преподаватель (teacher)</option>
                    <option value="manager">Менеджер (manager)</option>
                    <option value="admin">Администратор (admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                  <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" placeholder={editingUser ? 'Оставьте пустым, чтобы не менять' : 'Обязательно'} />
                </div>
              </div>

              {formData.role !== 'user' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ФИО (Для сотрудников)</label>
                  <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}

              {formData.role === 'user' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Имя ученика</label>
                      <input type="text" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Имя родителя</label>
                      <input type="text" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
                    <input type="date" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition">Отмена</button>
              <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

