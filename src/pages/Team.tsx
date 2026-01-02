import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, MagnifyingGlassIcon, PlusIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, UserRole } from '../types';
import toast from 'react-hot-toast';

const Team = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Users fetch timeout')), 5000);
      });
      const promise = getDocs(query(collection(db, 'users')));
      const snapshot = await Promise.race([promise, timeoutPromise]);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
      setUsers(data);
    } catch (error) {
      // Handle timeout silently - don't log timeout errors
      if (!(error instanceof Error) || !error.message.includes('timeout')) {
        console.error('Error fetching users:', error);
      }
      toast.error('Failed to load team members');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700',
    project_manager: 'bg-blue-100 text-blue-700',
    technical_team: 'bg-green-100 text-green-700',
    finance: 'bg-yellow-100 text-yellow-700',
    finance_officer: 'bg-orange-100 text-orange-700',
    auditor: 'bg-gray-100 text-gray-700',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="spinner w-12 h-12" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-800">Team</h1>
          <p className="text-secondary-500 mt-1">Manage team members and roles</p>
        </div>
        <button className="btn-primary"><PlusIcon className="w-5 h-5 mr-2" />Add Member</button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input type="text" placeholder="Search team members..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')} className="input w-48" title="Filter by role">
            <option value="all">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="project_manager">Project Manager</option>
            <option value="technical_team">Technical Team</option>
            <option value="finance_officer">Finance Officer</option>
            <option value="auditor">Auditor</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state py-16">
          <UsersIcon className="empty-state-icon" />
          <h3 className="empty-state-title">No team members found</h3>
          <p className="empty-state-description">Invite team members to collaborate</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <motion.div key={user.id} whileHover={{ y: -4 }} className="card p-6 text-center">
              <div className="avatar avatar-xl mx-auto mb-4 bg-primary-100 text-primary-700 text-xl">
                {user.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <h3 className="font-semibold text-secondary-800 mb-1">{user.displayName}</h3>
              <span className={`badge ${roleColors[user.role]} mb-3`}>{user.role.replace('_', ' ')}</span>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2 text-secondary-500">
                  <EnvelopeIcon className="w-4 h-4" />{user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center justify-center gap-2 text-secondary-500">
                    <PhoneIcon className="w-4 h-4" />{user.phone}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Team;
