import React, { useState } from 'react';
import { Task } from '../types';

type TaskModalProps = {
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
};

const TaskModal: React.FC<TaskModalProps> = ({ onClose, onSave }) => {
  const [taskData, setTaskData] = useState<Partial<Task>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(taskData);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create New Task</h2>
        <input
          type="text"
          name="title"
          placeholder="Task Title"
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Task Description"
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default TaskModal;
