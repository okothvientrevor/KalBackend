import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PaperClipIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { StatusUpdateType } from '../../types';
import toast from 'react-hot-toast';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (update: {
    status: StatusUpdateType;
    customStatus?: string;
    message: string;
    attachments?: File[];
  }) => Promise<void>;
  entityType: 'task' | 'project';
}

const statusOptions: { value: StatusUpdateType; label: string }[] = [
  { value: 'project_started', label: 'Project Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'awaiting_finances', label: 'Awaiting Finances from Finance' },
  { value: 'materials_ordered', label: 'Materials Ordered' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'testing_phase', label: 'Testing Phase' },
  { value: 'ready_for_review', label: 'Ready for Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'custom', label: 'Custom Status' },
];

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  entityType,
}) => {
  const [status, setStatus] = useState<StatusUpdateType>('in_progress');
  const [customStatus, setCustomStatus] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (status === 'custom' && !customStatus.trim()) {
      toast.error('Please enter a custom status');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        status,
        customStatus: status === 'custom' ? customStatus : undefined,
        message,
        attachments: files.length > 0 ? files : undefined,
      });

      // Reset form
      setStatus('in_progress');
      setCustomStatus('');
      setMessage('');
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Error submitting update:', error);
      toast.error('Failed to submit update');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-secondary-800">
              Log {entityType === 'task' ? 'Task' : 'Project'} Update
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Status Selection */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusUpdateType)}
                className="input"
                required
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Status Input */}
            {status === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="customStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Status Title
                </label>
                <input
                  type="text"
                  id="customStatus"
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  placeholder="e.g., Waiting for Client Approval"
                  className="input"
                  required
                />
              </motion.div>
            )}

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Update Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the current status and any relevant details..."
                rows={4}
                className="textarea"
                required
              />
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <div className="space-y-3">
                {/* File Input */}
                <div className="flex gap-2">
                  <label className="btn-outline cursor-pointer flex-1">
                    <PaperClipIcon className="w-5 h-5 mr-2" />
                    Attach Files
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept="*/*"
                    />
                  </label>
                  <label className="btn-outline cursor-pointer flex-1">
                    <PhotoIcon className="w-5 h-5 mr-2" />
                    Add Photos
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {file.type.startsWith('image/') ? (
                            <PhotoIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <PaperClipIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                          title="Remove file"
                          aria-label={`Remove ${file.name}`}
                        >
                          <XMarkIcon className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Submit Update'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StatusUpdateModal;
