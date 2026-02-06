import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, userProfile } = useAuth();
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    password: '',
    role: 'technical_team' as UserRole,
    department: '',
    position: '',
    phone: '',
    mustChangePassword: true,
    sendWelcomeEmail: true,
  });

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password });
    setGeneratedPassword(password);
    toast.success('Password generated! Make sure to copy it.');
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(formData.password);
    toast.success('Password copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.displayName || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setCreating(true);
    
    try {
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const newUserId = userCredential.user.uid;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', newUserId), {
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        department: formData.department || '',
        position: formData.position || '',
        phone: formData.phone || '',
        isActive: true,
        mustChangePassword: formData.mustChangePassword,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser?.uid,
        createdByName: userProfile?.displayName || 'Admin',
      });

      // Log the user creation in audit logs
      await addDoc(collection(db, 'auditLogs'), {
        entityType: 'user',
        entityId: newUserId,
        entityName: formData.displayName,
        action: 'create',
        description: `Admin created new user account: ${formData.email}`,
        userId: currentUser?.uid,
        userName: userProfile?.displayName || 'Admin',
        timestamp: serverTimestamp(),
        changes: {
          email: formData.email,
          role: formData.role,
          department: formData.department,
        },
      });

      // TODO: Send welcome email if sendWelcomeEmail is true
      if (formData.sendWelcomeEmail) {
        console.log('Welcome email would be sent to:', formData.email);
        // You can integrate with SendGrid, AWS SES, or Firebase Functions
      }

      toast.success(`User ${formData.displayName} created successfully!`);
      
      // Show the password one more time
      if (generatedPassword) {
        toast.success(
          <div>
            <p className="font-semibold">Login Credentials Created!</p>
            <p className="text-sm mt-1">Email: {formData.email}</p>
            <p className="text-sm">Password: {generatedPassword}</p>
            <p className="text-xs text-gray-500 mt-1">⚠️ Save this password! It won't be shown again.</p>
          </div>,
          { duration: 10000 }
        );
      }

      // Reset form
      setFormData({
        email: '',
        displayName: '',
        password: '',
        role: 'technical_team',
        department: '',
        position: '',
        phone: '',
        mustChangePassword: true,
        sendWelcomeEmail: true,
      });
      setGeneratedPassword('');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = 'Failed to create user';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setFormData({
        email: '',
        displayName: '',
        password: '',
        role: 'technical_team',
        department: '',
        position: '',
        phone: '',
        mustChangePassword: true,
        sendWelcomeEmail: true,
      });
      setGeneratedPassword('');
      onClose();
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <UserPlusIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <Dialog.Title className="text-xl font-semibold text-secondary-800">
                      Create New User
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={creating}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email and Display Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        placeholder="user@kalengineering.com"
                        required
                        disabled={creating}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="input"
                        placeholder="John Doe"
                        required
                        disabled={creating}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Temporary Password <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="input pr-10"
                          placeholder="Enter or generate password"
                          required
                          disabled={creating}
                          minLength={8}
                        />                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label="Toggle password visibility"
                      >
                          {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={generatePassword}
                        disabled={creating}
                        className="btn-secondary whitespace-nowrap"
                      >
                        Generate
                      </button>
                      {formData.password && (
                        <button
                          type="button"
                          onClick={copyPassword}
                          disabled={creating}
                          className="btn-secondary"
                          title="Copy password"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 8 characters. User will be required to change on first login.
                    </p>
                  </div>

                  {/* Role and Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        className="input"
                        required
                        disabled={creating}
                        aria-label="User role"
                      >
                        <option value="technical_team">Technical Team</option>
                        <option value="project_manager">Project Manager</option>
                        <option value="finance">Finance</option>
                        <option value="finance_officer">Finance Officer</option>
                        <option value="auditor">Auditor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="input"
                        placeholder="Engineering, Finance, etc."
                        disabled={creating}
                      />
                    </div>
                  </div>

                  {/* Position and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Position/Title
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="input"
                        placeholder="Site Engineer, Accountant, etc."
                        disabled={creating}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input"
                        placeholder="+256 700 000000"
                        disabled={creating}
                      />
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.mustChangePassword}
                        onChange={(e) => setFormData({ ...formData, mustChangePassword: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        disabled={creating}
                      />
                      <span className="text-sm text-secondary-700">
                        Require password change on first login
                      </span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.sendWelcomeEmail}
                        onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        disabled={creating}
                      />
                      <span className="text-sm text-secondary-700">
                        Send welcome email with login credentials
                      </span>
                    </label>
                  </div>

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Important:</strong> Make sure to copy and securely share the password with the user.
                      It cannot be retrieved later.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={creating}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !formData.email || !formData.displayName || !formData.password}
                      className="btn-primary"
                    >
                      {creating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="w-5 h-5 mr-2" />
                          Create User
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateUserModal;
