'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { 
  LogOut, 
  Terminal, 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Users, 
  MessageSquare, 
  CreditCard,
  Settings,
  Trophy,
  User,
  ShoppingBag
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, mounted, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Загрузка...</p>
      </div>
    );
  }

  // Определяем пункты меню на основе роли пользователя
  const getMenuItems = (role?: string) => {
    const baseItems = [
      { name: 'Главная', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Профиль', href: '/dashboard/profile', icon: User },
    ];

    switch (role) {
      case 'user': // Ученик
        return [
          ...baseItems,
          { name: 'Мои курсы', href: '/dashboard/courses', icon: BookOpen },
          { name: 'Расписание', href: '/dashboard/schedule', icon: Calendar },
          { name: 'Мои достижения', href: '/dashboard/achievements', icon: Trophy },
        ];
      case 'teacher': // Преподаватель
        return [
          ...baseItems,
          { name: 'Мои ученики', href: '/dashboard/students', icon: Users },
          { name: 'Учебные материалы', href: '/dashboard/materials', icon: BookOpen },
          { name: 'Расписание', href: '/dashboard/schedule', icon: Calendar },
        ];
      case 'manager': // Менеджер
        return [
          ...baseItems,
          { name: 'Студенты', href: '/dashboard/students', icon: Users },
          { name: 'Группы', href: '/dashboard/manager/groups', icon: Users },
          { name: 'Расписание', href: '/dashboard/schedule', icon: Calendar },
          { name: 'Заказы (Магазин)', href: '/dashboard/manager/orders', icon: ShoppingBag },
        ];
      case 'admin': // Администратор
        return [
          ...baseItems,
          { name: 'История продаж', href: '/dashboard/admin/sales', icon: CreditCard },
          { name: 'Пользователи', href: '/dashboard/admin/users', icon: Users },
          { name: 'Управление курсами', href: '/dashboard/admin/courses', icon: BookOpen },
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems(user?.role);

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col hidden md:flex fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-900">
          <Link href="/dashboard" className="flex items-center gap-2 text-white">
            <Terminal size={24} className="text-blue-500" />
            <span className="font-bold text-lg tracking-tight">CodeSchool</span>
          </Link>
        </div>
        
        <div className="p-4 flex-grow overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard' 
                : pathname === item.href || pathname?.startsWith(item.href + '/');
                
              return (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white font-medium' 
                      : 'hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-blue-200' : 'text-gray-400'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
              {(user?.fullName || user?.studentName)?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || user?.studentName || 'Пользователь'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header (visible only on small screens) */}
        <header className="md:hidden bg-gray-900 text-white h-16 flex items-center justify-between px-4 sticky top-0 z-20">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Terminal size={24} className="text-blue-500" />
            <span className="font-bold text-lg">CodeSchool</span>
          </Link>
          <button 
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="text-gray-300 hover:text-white"
          >
            <LogOut size={24} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
