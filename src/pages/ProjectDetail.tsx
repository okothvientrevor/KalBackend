import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-800">Project Details</h1>
      <p className="text-secondary-500">Project ID: {projectId}</p>
    </motion.div>
  );
};

export default ProjectDetail;
