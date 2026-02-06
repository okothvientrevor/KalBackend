import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, MagnifyingGlassIcon, BanknotesIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Expenditure, ExpenditureStatus, ExpenditureCategory } from '../types';
import toast from 'react-hot-toast';
import { format, isValid } from 'date-fns';

const Expenditures: React.FC = () => {
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpenditureStatus | 'all'>('all');

  useEffect(() => {
    fetchExpenditures();
  }, []);

  const fetchExpenditures = async () => {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Expenditures fetch timeout')), 5000);
      });
      const expQuery = query(collection(db, 'expenditures'), orderBy('createdAt', 'desc'));
      const promise = getDocs(expQuery);
      const snapshot = await Promise.race([promise, timeoutPromise]);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Expenditure[];
      setExpenditures(data);
    } catch (error) {
      // Handle timeout silently - don't log timeout errors
      if (!(error instanceof Error) || !error.message.includes('timeout')) {
        console.error('Error fetching expenditures:', error);
      }
      toast.error('Failed to load expenditures');
      setExpenditures([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenditures = expenditures.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<ExpenditureStatus, { bg: string; text: string; icon: React.ElementType }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: ClockIcon },
    team_lead_approved: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircleIcon },
    pm_approved: { bg: 'bg-purple-100', text: 'text-purple-700', icon: CheckCircleIcon },
    accounts_approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircleIcon },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircleIcon },
  };

  const categoryLabels: Record<ExpenditureCategory, string> = {
    fuel: 'Fuel', materials: 'Materials', labour: 'Labour', equipment: 'Equipment',
    transport: 'Transport', utilities: 'Utilities', petty_cash: 'Petty Cash', other: 'Other',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="spinner w-12 h-12" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-800">Expenditures</h1>
          <p className="text-secondary-500 mt-1">Track and approve all expenses</p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Log Expenditure
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search expenditures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ExpenditureStatus | 'all')}
            className="input w-48"
            title="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="team_lead_approved">Team Lead Approved</option>
            <option value="pm_approved">PM Approved</option>
            <option value="accounts_approved">Accounts Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredExpenditures.length === 0 ? (
        <div className="empty-state py-16">
          <BanknotesIcon className="empty-state-icon" />
          <h3 className="empty-state-title">No expenditures found</h3>
          <p className="empty-state-description">Log your first expenditure to get started</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Project</th>
                  <th>Requested By</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenditures.map((exp) => {
                  const statusStyle = statusColors[exp.status];
                  const StatusIcon = statusStyle.icon;
                  return (
                    <tr key={exp.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="font-medium text-secondary-800">{exp.title}</td>
                      <td className="font-semibold text-secondary-800">UGX {exp.amount.toLocaleString()}</td>
                      <td><span className="badge badge-secondary">{categoryLabels[exp.category]}</span></td>
                      <td className="text-secondary-600">{exp.projectName || '-'}</td>
                      <td className="text-secondary-600">{exp.requestedByName}</td>
                      <td className="text-secondary-500">{(() => { try { const d = new Date(exp.requestedAt); return isValid(d) ? format(d, 'MMM d, yyyy') : 'N/A'; } catch { return 'N/A'; } })()}</td>
                      <td>
                        <span className={`badge ${statusStyle.bg} ${statusStyle.text} flex items-center gap-1 w-fit`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {exp.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Expenditures;
