import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes } from 'firebase/storage';

const NewProject: React.FC = () => {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [document, setDocument] = useState<File | null>(null);

  const handleCreateProject = async () => {
    try {
      const projectRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (document) {
        const storageRef = ref(storage, `projects/${projectRef.id}/${document.name}`);
        await uploadBytes(storageRef, document);
      }

      setProjectData({ name: '', description: '', startDate: '', endDate: '' });
      setDocument(null);
      alert('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Project</h1>
      <div className="space-y-4">
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Project Name</label>
        <input
          id="projectName"
          type="text"
          placeholder="Project Name"
          value={projectData.name}
          onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
          className="input"
        />
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          placeholder="Description"
          value={projectData.description}
          onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
          className="textarea"
        />
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          id="startDate"
          type="date"
          placeholder="Start Date"
          value={projectData.startDate}
          onChange={(e) => setProjectData({ ...projectData, startDate: e.target.value })}
          className="input"
        />
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
        <input
          id="endDate"
          type="date"
          placeholder="End Date"
          value={projectData.endDate}
          onChange={(e) => setProjectData({ ...projectData, endDate: e.target.value })}
          className="input"
        />
        <label htmlFor="document" className="block text-sm font-medium text-gray-700">Upload Document</label>
        <input
          id="document"
          type="file"
          onChange={(e) => setDocument(e.target.files?.[0] || null)}
          className="input"
        />
        <button onClick={handleCreateProject} className="btn-primary">
          Save Project
        </button>
      </div>
    </div>
  );
};

export default NewProject;
