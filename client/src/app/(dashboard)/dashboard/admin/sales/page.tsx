'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { CreditCard, DollarSign, Search, ArrowUpDown, Filter } from 'lucide-react';

export default function AdminSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Search, Sort, Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, price_desc, price_asc
  const [filterCourse, setFilterCourse] = useState('all');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await apiClient.get('/admin/sales');
        setSales(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Extract unique courses for the filter dropdown
  const uniqueCourses = Array.from(new Set(sales.map(s => s.course?.id)))
    .map(id => sales.find(s => s.course?.id === id)?.course)
    .filter(Boolean);

  // Apply filters, search and sort
  const filteredAndSortedSales = sales
    .filter(sale => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (sale.user?.fullName || sale.customerName || '').toLowerCase().includes(searchLower) ||
        (sale.user?.studentName || sale.customerName || '').toLowerCase().includes(searchLower) ||
        (sale.user?.email || sale.customerEmail || '').toLowerCase().includes(searchLower) ||
        (sale.user?.phone || sale.customerPhone || '').toLowerCase().includes(searchLower) ||
        String(sale.id).includes(searchLower);
      
      const matchesCourse = filterCourse === 'all' || String(sale.course?.id) === filterCourse;

      return matchesSearch && matchesCourse;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.purchaseAt).getTime() - new Date(a.purchaseAt).getTime();
        case 'date_asc':
          return new Date(a.purchaseAt).getTime() - new Date(b.purchaseAt).getTime();
        case 'price_desc':
          return b.purchasePrice - a.purchasePrice;
        case 'price_asc':
          return a.purchasePrice - b.purchasePrice;
        default:
          return 0;
      }
    });

  const totalRevenue = filteredAndSortedSales.reduce((sum, sale) => sum + sale.purchasePrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CreditCard className="text-indigo-500"/> История продаж</h1>
          <p className="text-gray-500 text-sm mt-1">Подробный лог всех выданных доступов к курсам</p>
        </div>
        <div className="bg-green-50 border border-green-100 px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-green-800 font-medium uppercase tracking-wide">Сумма (по фильтрам)</p>
            <p className="text-xl font-bold text-green-700">{totalRevenue.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>
      </div>

      {/* Control Panel: Search, Filter, Sort */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Поиск (Имя, Email, Телефон, ID)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="flex-1 sm:w-48 rounded-xl border border-gray-200 p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">Все курсы</option>
              {uniqueCourses.map(c => (
                <option key={c.id} value={String(c.id)}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowUpDown size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:w-48 rounded-xl border border-gray-200 p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="date_desc">Сначала новые</option>
              <option value="date_asc">Сначала старые</option>
              <option value="price_desc">Сначала дорогие</option>
              <option value="price_asc">Сначала дешевые</option>
            </select>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">ID транзакции</th>
                <th className="px-6 py-4">Дата и Время</th>
                <th className="px-6 py-4">Ученик (Клиент)</th>
                <th className="px-6 py-4">Курс</th>
                <th className="px-6 py-4 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSortedSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    По вашему запросу ничего не найдено.
                  </td>
                </tr>
              ) : (
                filteredAndSortedSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-400 font-mono">#{sale.id}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(sale.purchaseAt).toLocaleDateString('ru-RU')} <span className="text-gray-400">{new Date(sale.purchaseAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        {sale.user ? (sale.user.fullName || sale.user.studentName || '—') : (sale.customerName || 'Удаленный пользователь')}
                        {!sale.user && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Удален</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.user ? sale.user.email : sale.customerEmail} • {sale.user ? (sale.user.phone || 'Нет телефона') : (sale.customerPhone || 'Нет телефона')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                        {sale.course?.title || 'Неизвестный курс'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-900">{sale.purchasePrice.toLocaleString('ru-RU')} ₽</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}