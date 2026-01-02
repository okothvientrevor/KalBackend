import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  ComputerDesktopIcon,
  QrCodeIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Asset } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Assets = () => {
  const { userProfile } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [_viewMode, _setViewMode] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState({
    name: '',
    assetTag: '',
    category: 'equipment' as Asset['category'],
    description: '',
    status: 'available' as Asset['status'],
    location: '',
    assignedTo: '',
    purchaseDate: '',
    purchasePrice: 0,
    condition: 'good' as Asset['condition'],
    warranty: {
      expiryDate: '',
      provider: '',
    },
    maintenanceSchedule: '',
    notes: '',
  });

  useEffect(() => {
    let isMounted = true;

    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 5000);

    const q = query(collection(db, 'assets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isMounted) {
        clearTimeout(timeout);
        const assetData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Asset[];
        setAssets(assetData);
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

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const assetData = {
        ...formData,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : null,
        warranty: {
          ...formData.warranty,
          expiryDate: formData.warranty.expiryDate ? new Date(formData.warranty.expiryDate) : null,
        },
      };

      if (editingAsset) {
        await updateDoc(doc(db, 'assets', editingAsset.id), {
          ...assetData,
          updatedAt: Timestamp.now(),
        });
      } else {
        await addDoc(collection(db, 'assets'), {
          ...assetData,
          createdBy: userProfile?.id,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteDoc(doc(db, 'assets', id));
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      assetTag: '',
      category: 'equipment',
      description: '',
      status: 'available',
      location: '',
      assignedTo: '',
      purchaseDate: '',
      purchasePrice: 0,
      condition: 'good',
      warranty: {
        expiryDate: '',
        provider: '',
      },
      maintenanceSchedule: '',
      notes: '',
    });
    setEditingAsset(null);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      assetTag: asset.assetTag || '',
      category: asset.category,
      description: asset.description || '',
      status: asset.status,
      location: asset.location || '',
      assignedTo: asset.assignedTo || '',
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
      purchasePrice: asset.purchasePrice || 0,
      condition: asset.condition || 'good',
      warranty: {
        expiryDate: asset.warranty?.expiryDate ? new Date(asset.warranty.expiryDate).toISOString().split('T')[0] : '',
        provider: asset.warranty?.provider || '',
      },
      maintenanceSchedule: asset.maintenanceSchedule || '',
      notes: asset.notes || '',
    });
    setShowModal(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'equipment':
        return <WrenchScrewdriverIcon className="w-5 h-5" />;
      case 'vehicle':
        return <TruckIcon className="w-5 h-5" />;
      case 'it_hardware':
        return <ComputerDesktopIcon className="w-5 h-5" />;
      default:
        return <CubeIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = {
    total: assets.length,
    available: assets.filter((a) => a.status === 'available').length,
    inUse: assets.filter((a) => a.status === 'in_use').length,
    maintenance: assets.filter((a) => a.status === 'maintenance').length,
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Assets & Inventory</h1>
          <p className="text-gray-600">Manage company assets and equipment</p>
        </div>
        {(userProfile?.role === 'admin' || userProfile?.role === 'project_manager') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Asset
          </motion.button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CubeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckBadgeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CubeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Use</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inUse}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <WrenchScrewdriverIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maintenance}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
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
              <option value="all">All Categories</option>
              <option value="equipment">Equipment</option>
              <option value="vehicle">Vehicles</option>
              <option value="it_hardware">IT Hardware</option>
              <option value="furniture">Furniture</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="card p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getCategoryIcon(asset.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                    {asset.assetTag && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <QrCodeIcon className="w-4 h-4" />
                        {asset.assetTag}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                  {asset.status.replace('_', ' ')}
                </span>
              </div>

              {asset.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{asset.description}</p>
              )}

              <div className="space-y-2 text-sm">
                {asset.location && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPinIcon className="w-4 h-4" />
                    {asset.location}
                  </div>
                )}
                {asset.condition && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Condition:</span>
                    <span className={`font-medium capitalize ${getConditionColor(asset.condition)}`}>
                      {asset.condition}
                    </span>
                  </div>
                )}
                {asset.purchasePrice && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>Value: KES {asset.purchasePrice.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {(userProfile?.role === 'admin' || userProfile?.role === 'project_manager') && (
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(asset)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    aria-label={`Edit ${asset.name}`}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={`Delete ${asset.name}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAssets.length === 0 && (
          <div className="col-span-full text-center py-12">
            <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-600">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first asset to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {editingAsset ? 'Edit Asset' : 'Add Asset'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input w-full"
                      required
                      placeholder="Enter asset name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Tag
                    </label>
                    <input
                      type="text"
                      value={formData.assetTag}
                      onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
                      className="input w-full"
                      placeholder="e.g., AST-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Asset['category'] })}
                      className="input w-full"
                      aria-label="Select category"
                    >
                      <option value="equipment">Equipment</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="it_hardware">IT Hardware</option>
                      <option value="furniture">Furniture</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Asset['status'] })}
                      className="input w-full"
                      aria-label="Select status"
                    >
                      <option value="available">Available</option>
                      <option value="in_use">In Use</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input w-full"
                    rows={2}
                    placeholder="Enter asset description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input w-full"
                      placeholder="e.g., Main Office"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value as Asset['condition'] })}
                      className="input w-full"
                      aria-label="Select condition"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Date
                    </label>
                    <input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="input w-full"
                      title="Purchase Date"
                    />
                  </div>
                  <div>
                    <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Price (KES)
                    </label>
                    <input
                      id="purchasePrice"
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                      className="input w-full"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input w-full"
                    rows={2}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingAsset ? 'Update' : 'Add'} Asset
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

export default Assets;
