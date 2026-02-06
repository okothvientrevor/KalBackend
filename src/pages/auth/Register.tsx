import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import toast from 'react-hot-toast';
import { checkAdminExists } from '../../utils/adminSetup';

const Register: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('technical_team');
  const [loading, setLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [allowAdminSignup, setAllowAdminSignup] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Check if admin exists on component mount
  useEffect(() => {
    const checkAdmin = async () => {
      console.log('🚀 Register component: Starting admin check...');
      try {
        const adminExists = await checkAdminExists();
        console.log(`📋 Register component: Admin exists = ${adminExists}`);
        const allowSignup = !adminExists;
        console.log(`🔓 Register component: Allow admin signup = ${allowSignup}`);
        setAllowAdminSignup(allowSignup);
      } catch (error) {
        console.error('❌ Register component: Error checking admin status:', error);
        setAllowAdminSignup(false);
      } finally {
        setCheckingAdmin(false);
        console.log('✅ Register component: Admin check complete');
      }
    };
    
    checkAdmin();
  }, []);

  const roles: { value: UserRole; label: string; description?: string }[] = [
    { value: 'technical_team', label: 'Technical Team Member', description: 'For engineers and technical staff' },
    { value: 'project_manager', label: 'Project Manager', description: 'Manage projects and teams' },
    { value: 'finance_officer', label: 'Finance Officer', description: 'Handle financial operations' },
    { value: 'auditor', label: 'Auditor', description: 'Review and audit activities' },
    { 
      value: 'admin' as UserRole, 
      label: 'Administrator', 
      description: 'Full system access' 
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Additional warning for admin sign-up
    if (role === 'admin' && allowAdminSignup) {
      const confirmed = window.confirm(
        '⚠️ You are creating the initial administrator account.\n\n' +
        'This account will have full system access. Please ensure you:\n' +
        '• Use a strong password\n' +
        '• Keep these credentials secure\n' +
        '• Remember that this option will be disabled after the first admin is created\n\n' +
        'Do you want to continue?'
      );
      
      if (!confirmed) {
        return;
      }
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName, role);
      
      // Log admin creation if this is an admin account
      if (role === 'admin') {
        toast.success('Administrator account created successfully! Welcome to KAL Engineering.');
        console.log('Initial admin account created:', email);
      } else {
        toast.success('Account created successfully!');
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking for admin
  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">KAL Engineering</h1>
              <p className="text-primary-100 text-sm">Services Ltd</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white leading-tight">
              Join Our Team<br />
              Today
            </h2>
            <p className="mt-4 text-primary-100 text-lg">
              Create your account to start managing projects, tasks, and collaborate with your team.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-3"
          >
            {[
              'Task & Project Management',
              'Expenditure Tracking',
              'Document Management',
              'Real-time Collaboration',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {feature}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="text-primary-100 text-sm">
          © 2024 KAL Engineering Services Ltd. All rights reserved.
        </div>
      </motion.div>

      {/* Right side - Register form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-8 bg-gray-50"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-secondary-800">KAL Engineering</h1>
                <p className="text-secondary-500 text-sm">Services Ltd</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-800">Create Account</h2>
              <p className="text-secondary-500 mt-2">Sign up to get started</p>
              
              {/* Debug Info - Remove in production */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <p className="text-xs font-mono text-blue-800">
                  <strong>Debug Info:</strong><br />
                  allowAdminSignup: {String(allowAdminSignup)}<br />
                  checkingAdmin: {String(checkingAdmin)}
                </p>
              </div>
              
              {allowAdminSignup && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-medium text-amber-800">⚠️ Initial Setup Mode</p>
                      <p className="text-xs text-amber-700 mt-1">
                        No admin account exists. You can create the first administrator account.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-secondary-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="input"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {roles.find(r => r.value === role)?.description && (
                  <p className="mt-1.5 text-xs text-secondary-500">
                    {roles.find(r => r.value === role)?.description}
                  </p>
                )}
                {role === 'admin' && allowAdminSignup && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    ⚠️ Administrator accounts have full system access. This option will be disabled after creation.
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-secondary-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
