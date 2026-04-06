import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  change?: number;
}

const StatCard = ({ title, value, icon: Icon, color, change }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border-l-4 hover:shadow-xl transition-all"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? `+${change}` : `${change}%`} so với tuần trước
            </p>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;