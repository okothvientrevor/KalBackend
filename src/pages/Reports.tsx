import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentArrowDownIcon,
  CalendarIcon,
  XMarkIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';

interface ReportConfig {
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const Reports = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');

  const reportTypes: ReportConfig[] = [
    {
      type: 'task_summary',
      name: 'Task Summary Report',
      description: 'Overview of all tasks by status, priority, and assignee',
      icon: <ClipboardDocumentListIcon className="w-8 h-8" />,
      color: 'bg-blue-500',
    },
    {
      type: 'project_progress',
      name: 'Project Progress Report',
      description: 'Detailed progress tracking for all projects',
      icon: <ChartBarIcon className="w-8 h-8" />,
      color: 'bg-green-500',
    },
    {
      type: 'expenditure',
      name: 'Expenditure Report',
      description: 'Financial summary of all expenditures',
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      color: 'bg-yellow-500',
    },
    {
      type: 'team_performance',
      name: 'Team Performance Report',
      description: 'Performance metrics for team members',
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: 'bg-purple-500',
    },
    {
      type: 'audit_trail',
      name: 'Audit Trail Report',
      description: 'Complete audit log export',
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      color: 'bg-red-500',
    },
    {
      type: 'budget_analysis',
      name: 'Budget vs Actual Report',
      description: 'Budget comparison and variance analysis',
      icon: <ChartPieIcon className="w-8 h-8" />,
      color: 'bg-indigo-500',
    },
  ];

  const handleGenerateReport = (report: ReportConfig) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleConfirmGenerate = async () => {
    if (!selectedReport) return;
    
    setGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a mock download
    const mockData = `${selectedReport.name}\nGenerated: ${new Date().toLocaleString()}\nDate Range: ${dateRange.startDate} to ${dateRange.endDate}\nFormat: ${format.toUpperCase()}`;
    const blob = new Blob([mockData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport.type}_report_${Date.now()}.${format === 'pdf' ? 'txt' : 'csv'}`;
    a.click();
    URL.revokeObjectURL(url);
    
    setGenerating(false);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and export reports</p>
      </div>

      {/* Quick Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Quick Range:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Last 7 days', 'Last 30 days', 'Last 90 days', 'This Year'].map((range) => (
              <button
                key={range}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => (
          <motion.div
            key={report.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="card p-6 cursor-pointer group hover:shadow-lg transition-all"
            onClick={() => handleGenerateReport(report)}
          >
            <div className={`w-14 h-14 ${report.color} rounded-xl flex items-center justify-center text-white mb-4`}>
              {report.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <button className="btn-secondary w-full group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all flex items-center justify-center gap-2">
              <DocumentArrowDownIcon className="w-5 h-5" />
              Generate Report
            </button>
          </motion.div>
        ))}
      </div>

      {/* Recent Reports Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Generated Reports</h2>
        <div className="text-center py-8 text-gray-500">
          <DocumentArrowDownIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No reports generated yet</p>
          <p className="text-sm">Click on any report type above to generate your first report</p>
        </div>
      </div>

      {/* Generate Modal */}
      <AnimatePresence>
        {showModal && selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !generating && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${selectedReport.color} rounded-lg flex items-center justify-center text-white`}>
                    {selectedReport.icon}
                  </div>
                  <h2 className="text-lg font-semibold">{selectedReport.name}</h2>
                </div>
                <button
                  onClick={() => !generating && setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  disabled={generating}
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="input w-full"
                        aria-label="Start date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="input w-full"
                        aria-label="End date"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormat('pdf')}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                        format === 'pdf'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => setFormat('excel')}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                        format === 'excel'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Excel
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                    disabled={generating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmGenerate}
                    className="btn-primary flex items-center gap-2"
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
