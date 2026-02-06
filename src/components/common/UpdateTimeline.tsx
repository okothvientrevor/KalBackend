import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export interface UpdateItem {
  id: string;
  status: string;
  message: string;
  timestamp: Date;
  userId: string;
  userName: string;
  isCompleted: boolean;
}

interface UpdateTimelineProps {
  updates: UpdateItem[];
  themeColor?: string;
}

const UpdateTimeline: React.FC<UpdateTimelineProps> = ({ updates, themeColor = 'blue' }) => {
  return (
    <div className="space-y-4">
      {updates.map((update, index) => (
        <motion.div
          key={update.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-4"
        >
          {/* Timeline connector */}
          <div className="flex flex-col items-center">
            {update.isCompleted ? (
              <div className={`w-8 h-8 rounded-full bg-${themeColor}-600 flex items-center justify-center`}>
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className={`w-8 h-8 rounded-full border-2 border-${themeColor}-300 bg-white flex items-center justify-center`}>
                <ClockIcon className={`w-5 h-5 text-${themeColor}-600`} />
              </div>
            )}
            {index < updates.length - 1 && (
              <div className={`w-0.5 h-full min-h-[40px] ${update.isCompleted ? `bg-${themeColor}-600` : 'bg-gray-200'}`} />
            )}
          </div>

          {/* Update content */}
          <div className="flex-1 pb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-semibold ${update.isCompleted ? `text-${themeColor}-700` : 'text-gray-700'}`}>
                  {update.status}
                </h4>
                <span className="text-xs text-gray-500">
                  {new Date(update.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{update.message}</p>
              <p className="text-xs text-gray-500">by {update.userName}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default UpdateTimeline;
