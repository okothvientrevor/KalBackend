import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes } from 'firebase/storage';

const NewTask: React.FC = () => {
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    dueDate: '',
    projectId: '',
  });
  const [document, setDocument] = useState<File | null>(null);

  const handleCreateTask = async () => {
    try {
      if (!taskData.name || !taskData.description || !taskData.dueDate) {
        alert('Please fill in all required fields.');
        return;
      }

      const taskRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        creatorName: 'Unknown',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (document) {
        const storageRef = ref(storage, `tasks/${taskRef.id}/${document.name}`);
        await uploadBytes(storageRef, document);
      }

      setTaskData({ name: '', description: '', dueDate: '', projectId: '' });
      setDocument(null);
      alert('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Task</h1>
      <div className="space-y-4">
        <label htmlFor="taskName" className="block text-sm font-medium text-gray-700">Task Name</label>
        <input
          id="taskName"
          type="text"
          placeholder="Task Name"
          value={taskData.name}
          onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
          className="input"
        />
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          placeholder="Description"
          value={taskData.description}
          onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          className="textarea"
        />
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          id="dueDate"
          type="date"
          placeholder="Due Date"
          value={taskData.dueDate}
          onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
          className="input"
        />
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">Project ID (optional)</label>
        <input
          id="projectId"
          type="text"
          placeholder="Project ID (optional)"
          value={taskData.projectId}
          onChange={(e) => setTaskData({ ...taskData, projectId: e.target.value })}
          className="input"
        />
        <label htmlFor="document" className="block text-sm font-medium text-gray-700">Upload Document</label>
        <input
          id="document"
          type="file"
          onChange={(e) => setDocument(e.target.files?.[0] || null)}
          className="input"
        />
        <button onClick={handleCreateTask} className="btn-primary">
          Save Task
        </button>
      </div>
    </div>
  );
};

export default NewTask;
