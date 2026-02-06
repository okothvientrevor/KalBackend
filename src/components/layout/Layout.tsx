import React, { useState, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  BanknotesIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Expenditures', href: '/expenditures', icon: BanknotesIcon },
  { name: 'Budgets', href: '/budgets', icon: CurrencyDollarIcon, roles: ['admin', 'project_manager', 'finance_officer'] },
  { name: 'Documents', href: '/documents', icon: DocumentDuplicateIcon },
  { name: 'Team', href: '/team', icon: UsersIcon },
  { name: 'Assets', href: '/assets', icon: WrenchScrewdriverIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Audit Logs', href: '/audit-logs', icon: ClipboardDocumentCheckIcon, roles: ['admin', 'auditor'] },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const adminNavigation: NavItem[] = [
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: ChartBarIcon, roles: ['admin'] },
  { name: 'User Management', href: '/admin/users', icon: ShieldCheckIcon, roles: ['admin'] },
  { name: 'Approvals', href: '/admin/approvals', icon: ClipboardDocumentCheckIcon, roles: ['admin', 'project_manager', 'finance'] },
  { name: 'Verifications', href: '/admin/verifications', icon: DocumentCheckIcon, roles: ['admin', 'project_manager'] },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [_expandedMenu, _setExpandedMenu] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, currentUser, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userProfile?.role as UserRole);
  });

  const filteredAdminNavigation = adminNavigation.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userProfile?.role as UserRole);
  });

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  const overlayVariants = {
    open: { opacity: 1, transition: { duration: 0.3 } },
    closed: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">K</span>
                  </div>
                  <span className="text-xl font-bold text-secondary-800">KAL ENG</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Close sidebar"
                  aria-label="Close sidebar"
                >
                  <XMarkIcon className="w-6 h-6 text-secondary-600" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                  {filteredNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                {filteredAdminNavigation.length > 0 && (
                  <>
                    <div className="mt-6 mb-2 px-4">
                      <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider">
                        Administration
                      </p>
                    </div>
                    <ul className="space-y-1">
                      {filteredAdminNavigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                          >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-100">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-100">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <span className="text-xl font-bold text-secondary-800">KAL ENG</span>
                <p className="text-xs text-secondary-500">Engineering Services</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {filteredAdminNavigation.length > 0 && (
              <>
                <div className="mt-6 mb-2 px-4">
                  <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider">
                    Administration
                  </p>
                </div>
                <ul className="space-y-1">
                  {filteredAdminNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="avatar avatar-md bg-primary-100 text-primary-700">
                {userProfile?.displayName?.[0]?.toUpperCase() || userProfile?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-800 truncate">
                  {userProfile?.displayName || userProfile?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-secondary-500 capitalize">
                  {userProfile?.role ? userProfile.role.replace('_', ' ') : 'Member'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <Bars3Icon className="w-6 h-6 text-secondary-600" />
            </button>

            {/* Search bar (desktop) */}
            <div className="hidden lg:flex lg:flex-1 lg:max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search tasks, projects, documents..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <BellIcon className="w-6 h-6 text-secondary-600" />
                <span className="notification-badge">3</span>
              </button>

              {/* User menu */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="avatar avatar-sm bg-primary-100 text-primary-700">
                    {userProfile?.displayName?.[0]?.toUpperCase() || userProfile?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-secondary-500" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="dropdown-menu w-56">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-secondary-800">
                        {userProfile?.displayName || userProfile?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-secondary-500 truncate">
                        {userProfile?.email || currentUser?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`dropdown-item flex items-center gap-2 ${
                              active ? 'bg-gray-50' : ''
                            }`}
                          >
                            <UserCircleIcon className="w-5 h-5 text-secondary-400" />
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/settings"
                            className={`dropdown-item flex items-center gap-2 ${
                              active ? 'bg-gray-50' : ''
                            }`}
                          >
                            <Cog6ToothIcon className="w-5 h-5 text-secondary-400" />
                            Settings
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleSignOut}
                            className={`dropdown-item w-full flex items-center gap-2 text-danger-600 ${
                              active ? 'bg-danger-50' : ''
                            }`}
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
