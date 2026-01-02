import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon,
  DocumentTextIcon,
  PhotoIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  TableCellsIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Document as DocumentType } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Documents = () => {
  const { userProfile } = useAuth();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadData, setUploadData] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: [] as string[],
    file: null as File | null,
  });

  useEffect(() => {
    let isMounted = true;

    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 5000);

    const q = query(collection(db, 'documents'), orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isMounted) {
        clearTimeout(timeout);
        const docData = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as DocumentType[];
        setDocuments(docData);
        setLoading(false);
      }
    }, (error) => {
      // Handle timeout silently - don't log timeout errors
      if (!(error instanceof Error) || !error.message.includes('timeout')) {
        console.error('Error in onSnapshot:', error);
      }
      if (isMounted) {
        clearTimeout(timeout);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || document.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData({
        ...uploadData,
        name: file.name,
        file,
      });
      setShowUploadModal(true);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file || !userProfile) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `documents/${Date.now()}_${uploadData.file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, uploadData.file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          await addDoc(collection(db, 'documents'), {
            name: uploadData.name,
            description: uploadData.description,
            url: downloadURL,
            type: uploadData.file!.type,
            size: uploadData.file!.size,
            category: uploadData.category,
            tags: uploadData.tags,
            uploadedBy: userProfile.id,
            uploadedByName: userProfile.displayName,
            uploadedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            version: 1,
            previousVersions: [],
            accessRoles: ['admin', 'project_manager', 'technical_team', 'finance', 'auditor'],
          });

          setShowUploadModal(false);
          setUploadData({ name: '', description: '', category: 'general', tags: [], file: null });
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploading(false);
    }
  };

  const handleDelete = async (document: DocumentType) => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      try {
        const storageRef = ref(storage, document.url);
        await deleteObject(storageRef).catch(() => {});
        await deleteDoc(doc(db, 'documents', document.id));
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <PhotoIcon className="w-8 h-8 text-purple-500" />;
    if (type.includes('pdf')) return <DocumentTextIcon className="w-8 h-8 text-red-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <TableCellsIcon className="w-8 h-8 text-green-500" />;
    return <DocumentIcon className="w-8 h-8 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'reports', label: 'Reports' },
    { value: 'drawings', label: 'Drawings' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'specifications', label: 'Specifications' },
    { value: 'other', label: 'Other' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage project documents and files</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Upload Document
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload document"
        />
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input"
                aria-label="Filter by category"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              aria-label="Grid view"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              aria-label="List view"
            >
              <TableCellsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredDocuments.map((document, index) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="card p-4 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center gap-3 mb-3">
                  {getFileIcon(document.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
                    <p className="text-xs text-gray-500">{formatFileSize(document.size)}</p>
                  </div>
                </div>
                
                {document.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded">{document.category}</span>
                  <span>v{document.version}</span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-gray-100 rounded"
                      aria-label="View document"
                    >
                      <EyeIcon className="w-4 h-4 text-gray-600" />
                    </a>
                    <a
                      href={document.url}
                      download
                      className="p-1.5 hover:bg-gray-100 rounded"
                      aria-label="Download document"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 text-gray-600" />
                    </a>
                    {(userProfile?.role === 'admin' || userProfile?.id === document.uploadedBy) && (
                      <button
                        onClick={() => handleDelete(document)}
                        className="p-1.5 hover:bg-red-50 rounded"
                        aria-label="Delete document"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(document.type)}
                      <span className="font-medium text-gray-900">{document.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-sm text-gray-600">{document.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatFileSize(document.size)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a href={document.url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 rounded" aria-label="View">
                        <EyeIcon className="w-4 h-4 text-gray-600" />
                      </a>
                      <a href={document.url} download className="p-1.5 hover:bg-gray-100 rounded" aria-label="Download">
                        <ArrowDownTrayIcon className="w-4 h-4 text-gray-600" />
                      </a>
                      {(userProfile?.role === 'admin' || userProfile?.id === document.uploadedBy) && (
                        <button onClick={() => handleDelete(document)} className="p-1.5 hover:bg-red-50 rounded" aria-label="Delete">
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredDocuments.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== 'all' ? 'Try adjusting your filters' : 'Upload your first document to get started'}
          </p>
          <button onClick={() => fileInputRef.current?.click()} className="btn-primary inline-flex items-center gap-2">
            <CloudArrowUpIcon className="w-5 h-5" />Upload Document
          </button>
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !uploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Upload Document</h2>
                <button onClick={() => !uploading && setShowUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-lg" disabled={uploading} aria-label="Close modal">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-4">
                {uploadData.file && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {getFileIcon(uploadData.file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{uploadData.file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(uploadData.file.size)}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                  <input type="text" value={uploadData.name} onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })} className="input w-full" required placeholder="Enter document name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={uploadData.description} onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })} className="input w-full" rows={2} placeholder="Brief description (optional)" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={uploadData.category} onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })} className="input w-full" aria-label="Select category">
                    {categories.filter(c => c.value !== 'all').map((cat) => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
                  </select>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="font-medium">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-primary-600 rounded-full" />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary" disabled={uploading}>Cancel</button>
                  <button type="submit" className="btn-primary flex items-center gap-2" disabled={uploading}>
                    {uploading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading...</>) : (<><CloudArrowUpIcon className="w-5 h-5" />Upload</>)}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Documents;
