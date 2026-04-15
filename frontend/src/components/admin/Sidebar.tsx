import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Utensils, BookOpen, Star, MessageSquare, 
  Settings, History, Bell, Sun, Moon, Brain, Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const menuItems = [
  { path: '/admin', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', name: 'Users', icon: Users },
  { path: '/admin/foods', name: 'Foods', icon: Utensils },
  { path: '/admin/recipes', name: 'Recipes', icon: BookOpen },
  { path: '/admin/reviews', name: 'Reviews', icon: Star },
  { path: '/admin/chat-ai', name: 'Chat AI', icon: MessageSquare },
  { path: '/admin/chatbot-ops', name: 'Chatbot Ops', icon: Brain },
  { path: '/admin/configs', name: 'Configs', icon: Settings },
  { path: '/admin/logs', name: 'Logs', icon: History },
  { path: '/admin/notifications', name: 'Notifications', icon: Bell },
  { path: '/admin/settings', name: 'Settings DB', icon: Database },
];

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-full w-64 bg-gray-900/90 dark:bg-black/90 backdrop-blur-xl text-white shadow-2xl z-20 flex flex-col border-r border-gray-800"
    >
      <div className="p-5 text-2xl font-bold border-b border-gray-800 flex items-center justify-between">
        <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Food AI Admin</span>
        <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-800 transition-colors">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
      <nav className="flex-1 mt-6 space-y-1 px-3 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-400 text-center">
        © 2025 Food AI System
      </div>
    </motion.aside>
  );
};

export default Sidebar;
