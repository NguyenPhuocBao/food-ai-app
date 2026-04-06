import { motion } from 'framer-motion';
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

interface AdvancedStatCardProps {
  title: string;
  value: number | string;
  icon: ForwardRefExoticComponent<LucideProps & RefAttributes<SVGSVGElement>>;
  color: string;
  trend?: number;
  trendLabel?: string;
}

const AdvancedStatCard = ({ title, value, icon: Icon, color, trend, trendLabel = 'so với tuần trước' }: AdvancedStatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{value}</p>
          {trend !== undefined && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% <span className="text-gray-400 text-xs">{trendLabel}</span>
            </p>
          )}
        </div>
        <div className="p-4 rounded-2xl" style={{ backgroundColor: `${color}20` }}>
          <Icon size={28} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
};

export default AdvancedStatCard;