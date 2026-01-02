import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold text-secondary-800">Task Details</h1>
      <p className="text-secondary-500">Task ID: {taskId}</p>
      {/* Full task detail implementation would go here */}
    </motion.div>
  );
};

export default TaskDetail;
