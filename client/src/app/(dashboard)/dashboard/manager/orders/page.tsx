'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { ShoppingBag, Search, Package, Phone, Mail, User, CheckCircle, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ManagerOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all'|'new'|'processing'|'delivered'|'cancelled'>('all');

  // Selected Order
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async (currentSelectedId?: number) => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/manager/store-orders');
      setOrders(res.data);

      const activeId = currentSelectedId || selectedOrder?.id;
      if (activeId) {
        const updated = res.data.find((o: any) => o.id === activeId);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      console.error('Ошибка загрузки заказов', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return;
    try {
      await apiClient.patch(`/users/manager/store-orders/${selectedOrder.id}`, { status });
      fetchOrders(selectedOrder.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка обновления статуса');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.user.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'new': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Новый</span>;
        case 'processing': return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold uppercase">В сборке</span>;
        case 'delivered': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Выдан</span>;
        case 'cancelled': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Отменен</span>;
        default: return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold uppercase">{status}</span>;
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex-shrink-0">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-900 to-transparent"></div>
        <h1 className="text-3xl font-bold text-white mb-2 relative z-10 flex items-center gap-3">
            <ShoppingBag className="text-indigo-400" size={32} /> Заказы из магазина
        </h1>
        <p className="text-gray-400 relative z-10">Обработка покупок учеников за бонусные баллы</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Левая колонка: Список заказов */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-2">
               <div className="flex flex-wrap gap-2">
                 <button onClick={() => setFilterStatus('all')} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${filterStatus === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Все</button>
                 <button onClick={() => setFilterStatus('new')} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${filterStatus === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Новые</button>
                 <button onClick={() => setFilterStatus('processing')} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${filterStatus === 'processing' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>В работе</button>
               </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Поиск по ученику или товару..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {filteredOrders.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 text-sm">Заказов не найдено.</div> 
            ) : (
             filteredOrders.map(order => (
               <div 
                 key={order.id} 
                 onClick={() => setSelectedOrder(order)}
                 className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                   selectedOrder?.id === order.id 
                     ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                     : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                 }`}
               >
                 <div className="flex justify-between items-start">
                   <h3 className={`text-sm font-bold truncate ${selectedOrder?.id === order.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                     {order.item.title}
                   </h3>
                   {getStatusBadge(order.status)}
                 </div>
                 <div className="text-xs text-gray-500 flex items-center gap-1">
                    <User size={12} className="text-gray-400"/> 
                    <span className="truncate">{order.user.studentName || order.user.fullName || order.user.email}</span>
                 </div>
                 <div className="text-xs text-gray-400 mt-1 font-mono">
                    {new Date(order.createdAt).toLocaleString('ru-RU')}
                 </div>
               </div>
             ))
            )}
          </div>
        </div>

        {/* Правая колонка: Детали заказа */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-y-auto relative">
          {!selectedOrder ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
               <Package size={64} className="text-gray-200 mb-4" />
               <p className="text-lg font-medium text-gray-600">Выберите заказ</p>
               <p className="text-sm mt-1">Нажмите на карточку в списке слева, чтобы увидеть детали и изменить статус.</p>
             </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className="text-gray-400 text-xs font-mono bg-gray-100 px-2 py-1 rounded">Заказ #{selectedOrder.id}</span>
                     {getStatusBadge(selectedOrder.status)}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">{selectedOrder.item.title}</h2>
                  <p className="text-indigo-600 font-bold mt-1">{selectedOrder.item.price} баллов</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-8 flex-1">
                {/* Карточка товара */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Информация о товаре</h3>
                  <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedOrder.item.bg} ${selectedOrder.item.color}`}>
                       <Package size={24} />
                     </div>
                     <div>
                        <p className="font-medium text-gray-900">{selectedOrder.item.title}</p>
                        <p className="text-sm text-gray-500">{selectedOrder.item.description}</p>
                     </div>
                  </div>
                </div>

                {/* Данные получателя */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Данные получателя (Ученика)</h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                            {(selectedOrder.user.studentName || selectedOrder.user.fullName || 'С').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{selectedOrder.user.studentName || selectedOrder.user.fullName || 'Без имени'}</p>
                            <p className="text-xs text-gray-500">ID ученика: {selectedOrder.user.id}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail size={16} className="text-gray-400" />
                            {selectedOrder.user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone size={16} className="text-gray-400" />
                            {selectedOrder.user.phone || 'Телефон не указан'}
                        </div>
                    </div>
                  </div>
                </div>

                {/* Менеджер */}
                {selectedOrder.manager && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Менеджер заказа</h3>
                    <p className="text-sm text-gray-700">
                        Этот заказ обрабатывает: <span className="font-semibold">{selectedOrder.manager.fullName || selectedOrder.manager.email}</span>
                    </p>
                  </div>
                )}
              </div>
              
              {/* Управление статусами */}
              <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50 shrink-0">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Изменить статус заказа</h3>
                 <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => handleUpdateStatus('processing')}
                        disabled={selectedOrder.status === 'processing'}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Package size={16} /> Взять в сборку
                    </button>
                    <button 
                        onClick={() => handleUpdateStatus('delivered')}
                        disabled={selectedOrder.status === 'delivered'}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle size={16} /> Отметить как выданный
                    </button>
                    <button 
                        onClick={() => handleUpdateStatus('cancelled')}
                        disabled={selectedOrder.status === 'cancelled'}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <XCircle size={16} /> Отменить
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
