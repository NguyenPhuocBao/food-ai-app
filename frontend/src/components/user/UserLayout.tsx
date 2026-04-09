import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Scan, 
  BookText, 
  MessageSquare, 
  User as UserIcon,
  Bot,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Trang Chủ', path: '/', icon: Home },
    { label: 'Quét Món Ăn', path: '/scan', icon: Scan },
    { label: 'Nhật Ký', path: '/diary', icon: BookText },
    { label: 'Trợ Lý AI', path: '/chat-ai', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left: Logo & Mobile Toggle */}
            <div className="flex items-center">
              <button 
                className="md:hidden p-2 mr-2 text-gray-500 hover:text-emerald-600"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-emerald-500 p-1.5 rounded-lg text-white shadow-md group-hover:bg-emerald-600 transition-colors">
                  <Bot size={22} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-black text-gray-900 tracking-tight hidden sm:block">
                  Food<span className="text-emerald-500">AI</span>
                </span>
              </Link>
            </div>

            {/* Center: Desktop Nav Items */}
            <nav className="hidden md:flex space-x-1 lg:space-x-4">
              {navItems.map(item => {
                 const isActive = location.pathname === item.path;
                 return (
                   <Link
                     key={item.path}
                     to={item.path}
                     className={`flex items-center px-4 py-2.5 rounded-xl font-bold transition-all duration-200 text-sm ${
                       isActive 
                         ? 'bg-emerald-50 text-emerald-600' 
                         : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                     }`}
                   >
                     <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="mr-2" />
                     {item.label}
                   </Link>
                 )
              })}
            </nav>

            {/* Right: Notifications & Profile */}
            <div className="flex items-center gap-2 lg:gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full relative transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                >
                   <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                     {user?.name?.charAt(0) || 'U'}
                   </div>
                   <div className="hidden lg:block text-left mr-1">
                     <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || 'Nguyễn Phước'}</p>
                   </div>
                   <ChevronDown size={16} className="text-gray-400 hidden lg:block" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-50 mb-2">
                        <p className="text-sm text-gray-500">Đăng nhập dưới tên</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700">
                        <UserIcon size={16} className="mr-3 text-gray-400" /> Hồ sơ cá nhân
                      </Link>
                      <button 
                        onClick={() => { setProfileDropdownOpen(false); logout(); }}
                        className="w-full flex items-center px-4 py-2 hover:bg-red-50 text-sm font-medium text-red-600"
                      >
                        <LogOut size={16} className="mr-3" /> Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
               initial={{ x: '-100%' }}
               animate={{ x: 0 }}
               exit={{ x: '-100%' }}
               transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
               className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 md:hidden flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                    <Bot size={22} strokeWidth={2.5} />
                  </div>
                  <span className="text-xl font-black text-gray-900 tracking-tight">FoodAI</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto flex-1">
                {navItems.map(item => (
                   <Link
                     key={item.path}
                     to={item.path}
                     onClick={() => setMobileMenuOpen(false)}
                     className={`flex items-center px-4 py-3 rounded-xl font-bold ${
                       location.pathname === item.path 
                         ? 'bg-emerald-50 text-emerald-600' 
                         : 'text-gray-600 hover:bg-gray-50'
                     }`}
                   >
                     <item.icon size={20} className="mr-3" />
                     {item.label}
                   </Link>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100">
                 <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-50 mb-2">
                    <UserIcon size={20} className="mr-3" /> Trợ Lý AI
                 </Link>
                 <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full flex items-center px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50">
                    <LogOut size={20} className="mr-3" /> Đăng xuất
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
      
    </div>
  );
};

export default UserLayout;
