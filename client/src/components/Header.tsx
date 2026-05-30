import Link from 'next/link';
import { Terminal, LogIn } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition">
          <Terminal size={28} strokeWidth={2.5} />
          <span className="font-bold text-xl tracking-tight">CodeSchool</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">О нас</Link>
          <Link href="#courses" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Курсы</Link>
          <Link href="#apply" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Оставить заявку</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full"
          >
            <LogIn size={18} />
            <span>Войти</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
