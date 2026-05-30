'use client';

import { useAuthStore } from '@/store/authStore';
import { Trophy, History, ShoppingBag, Gift, Music, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface StoreItem {
  id: number;
  title: string;
  description: string;
  price: number;
  icon: string;
  color: string;
  bg: string;
}

interface PointTransaction {
  id: number;
  amount: number;
  reason: string;
  createdAt: string;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Gift': return Gift;
    case 'Music': return Music;
    case 'Star': return Star;
    default: return Gift;
  }
};

export default function AchievementsPage() {
  const { user, setAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'store' | 'history'>('store');
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [history, setHistory] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const itemsRes = await apiClient.get('/users/store/items');
        setStoreItems(itemsRes.data);

        const historyRes = await apiClient.get(`/users/${user.id}/points-history`);
        setHistory(historyRes.data);
      } catch (err) {
        console.error("Failed to load achievements data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handlePurchase = async (item: StoreItem) => {
    if (!user) return;
    if ((user.bonusPoints || 0) < item.price) {
      alert('Недостаточно баллов для покупки!');
      return;
    }
    
    if (confirm(`Вы уверены, что хотите потратить ${item.price} баллов на "${item.title}"?`)) {
      try {
        const res = await apiClient.post(`/users/${user.id}/purchase-store-item`, { itemId: item.id });
        const updatedUser = res.data;
        const token = localStorage.getItem('token') || '';
        setAuth(updatedUser, token);
        
        alert(`Поздравляем! Заявка на получение "${item.title}" отправлена.`);
        
        // Refresh history
        const historyRes = await apiClient.get(`/users/${user.id}/points-history`);
        setHistory(historyRes.data);
        
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Ошибка при покупке');
        } else {
          alert('Ошибка при покупке');
        }
      }
    }
  };

  if (!user || user.role !== 'user') {
    return <div className="p-8 text-gray-500">Доступно только ученикам.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Мои достижения</h1>
        <p className="text-gray-500">Обменивайте заработанные баллы на крутые призы!</p>
      </div>

      {/* Баланс */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-8 shadow-lg text-white flex items-center justify-between">
        <div>
          <p className="text-amber-100 font-medium mb-1">Ваш баланс</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black">{user.bonusPoints || 0}</span>
            <span className="text-xl font-bold mb-1 opacity-90">баллов</span>
          </div>
          <p className="text-sm text-amber-100 mt-4">Вы получаете 100 баллов за каждое идеально сданное ДЗ!</p>
        </div>
        <Trophy size={100} className="opacity-20" />
      </div>

      {/* Навигация */}
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('store')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'store' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <ShoppingBag size={18} />
          Магазин призов
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <History size={18} />
          История начислений
        </button>
      </div>

      {/* Контент */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
      ) : activeTab === 'store' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {storeItems.map(item => {
            const Icon = getIcon(item.icon);
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition flex flex-col">
                <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-4`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1">{item.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-amber-500 text-xl">{item.price} б.</span>
                  <button 
                    onClick={() => handlePurchase(item)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition ${(user.bonusPoints || 0) >= item.price ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    Купить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-300">
          <div className="divide-y divide-gray-100">
            {history.length === 0 ? (
               <div className="p-8 text-center text-gray-500">История пуста. Заработайте баллы за выполнение заданий!</div>
            ) : history.map(record => (
              <div key={record.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {record.amount > 0 ? <Trophy size={18} /> : <ShoppingBag size={18} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{record.reason}</p>
                    <p className="text-xs text-gray-500">{new Date(record.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className={`font-bold ${record.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {record.amount > 0 ? '+' : ''}{record.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}