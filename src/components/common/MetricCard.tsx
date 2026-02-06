import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: string;
  lightColor?: string;
  textColor?: string;
  link?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  lightColor = 'bg-primary-50',
  textColor = 'text-primary-600',
  link,
  trend,
}) => {
  const CardContent = (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="stat-card group cursor-pointer h-full"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${lightColor}`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-secondary-500">{title}</p>
        <p className="text-2xl font-bold text-secondary-800 mt-1">{value}</p>
      </div>
    </motion.div>
  );

  if (link) {
    return <Link to={link}>{CardContent}</Link>;
  }

  return CardContent;
};

export default MetricCard;
