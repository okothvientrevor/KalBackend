import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  UserGroupIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const Settings = () => {
  const { userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('notifications');
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      projectUpdates: true,
      budgetAlerts: true,
      weeklyDigest: false,
      mentionNotifications: true,
    },
    appearance: {
      theme: 'system',
      compactMode: false,
      showAnimations: true,
      sidebarCollapsed: false,
    },
    privacy: {
      showOnlineStatus: true,
      showActivityStatus: true,
      allowProfileViewing: true,
      twoFactorAuth: false,
    },
    regional: {
      language: 'en',
      timezone: 'Africa/Nairobi',
      dateFormat: 'DD/MM/YYYY',
      currency: 'KES',
    },
  });

  const sections: SettingsSection[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <BellIcon className="w-5 h-5" />,
      description: 'Manage how you receive notifications',
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <PaintBrushIcon className="w-5 h-5" />,
      description: 'Customize the look and feel',
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      description: 'Control your privacy settings',
    },
    {
      id: 'regional',
      title: 'Regional Settings',
      icon: <GlobeAltIcon className="w-5 h-5" />,
      description: 'Language, timezone, and formats',
    },
  ];

  if (userProfile?.role === 'admin') {
    sections.push({
      id: 'organization',
      title: 'Organization',
      icon: <UserGroupIcon className="w-5 h-5" />,
      description: 'Organization-wide settings',
    });
  }

  const handleToggle = (category: keyof typeof settings, key: string) => {
    setSettings((prev) => {
      const categorySettings = prev[category] as Record<string, unknown>;
      return {
        ...prev,
        [category]: {
          ...categorySettings,
          [key]: !categorySettings[key],
        },
      };
    });
  };

  const handleSelect = (category: keyof typeof settings, key: string, value: string) => {
    setSettings((prev) => {
      const categorySettings = prev[category] as Record<string, unknown>;
      return {
        ...prev,
        [category]: {
          ...categorySettings,
          [key]: value,
        },
      };
    });
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Enable email notifications', desc: 'Receive updates via email' },
            { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Get a summary of your week every Monday' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('notifications', item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications[item.key as keyof typeof settings.notifications]
                    ? 'bg-primary-600'
                    : 'bg-gray-300'
                }`}
                aria-label={`Toggle ${item.label}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.notifications[item.key as keyof typeof settings.notifications]
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'pushNotifications', label: 'Enable push notifications', desc: 'Receive real-time updates' },
            { key: 'taskReminders', label: 'Task reminders', desc: 'Get notified about upcoming deadlines' },
            { key: 'projectUpdates', label: 'Project updates', desc: 'Updates on projects you follow' },
            { key: 'budgetAlerts', label: 'Budget alerts', desc: 'Notifications when budget thresholds are reached' },
            { key: 'mentionNotifications', label: 'Mentions', desc: 'When someone mentions you in a comment' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DevicePhoneMobileIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('notifications', item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications[item.key as keyof typeof settings.notifications]
                    ? 'bg-primary-600'
                    : 'bg-gray-300'
                }`}
                aria-label={`Toggle ${item.label}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.notifications[item.key as keyof typeof settings.notifications]
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: <SunIcon className="w-6 h-6" /> },
            { value: 'dark', label: 'Dark', icon: <MoonIcon className="w-6 h-6" /> },
            { value: 'system', label: 'System', icon: <ComputerDesktopIcon className="w-6 h-6" /> },
          ].map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleSelect('appearance', 'theme', theme.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.appearance.theme === theme.value
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className={settings.appearance.theme === theme.value ? 'text-primary-600' : 'text-gray-500'}>
                  {theme.icon}
                </span>
                <span className={`font-medium ${settings.appearance.theme === theme.value ? 'text-primary-600' : 'text-gray-700'}`}>
                  {theme.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display</h3>
        <div className="space-y-4">
          {[
            { key: 'compactMode', label: 'Compact mode', desc: 'Reduce spacing and element sizes' },
            { key: 'showAnimations', label: 'Show animations', desc: 'Enable smooth transitions and animations' },
            { key: 'sidebarCollapsed', label: 'Collapsed sidebar', desc: 'Start with sidebar collapsed by default' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => handleToggle('appearance', item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.appearance[item.key as keyof typeof settings.appearance]
                    ? 'bg-primary-600'
                    : 'bg-gray-300'
                }`}
                aria-label={`Toggle ${item.label}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.appearance[item.key as keyof typeof settings.appearance]
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
        <div className="space-y-4">
          {[
            { key: 'showOnlineStatus', label: 'Show online status', desc: 'Let others see when you are online' },
            { key: 'showActivityStatus', label: 'Show activity status', desc: 'Display what you are currently working on' },
            { key: 'allowProfileViewing', label: 'Allow profile viewing', desc: 'Let team members view your profile' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => handleToggle('privacy', item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.privacy[item.key as keyof typeof settings.privacy]
                    ? 'bg-primary-600'
                    : 'bg-gray-300'
                }`}
                aria-label={`Toggle ${item.label}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.privacy[item.key as keyof typeof settings.privacy]
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Two-factor authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('privacy', 'twoFactorAuth')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.privacy.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle two-factor authentication"
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.privacy.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {!settings.privacy.twoFactorAuth && (
            <p className="mt-3 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              ⚠️ We recommend enabling two-factor authentication for better security
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderRegional = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.regional.language}
              onChange={(e) => handleSelect('regional', 'language', e.target.value)}
              className="input w-full"
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.regional.timezone}
              onChange={(e) => handleSelect('regional', 'timezone', e.target.value)}
              className="input w-full"
              aria-label="Select timezone"
            >
              <option value="Africa/Nairobi">East Africa Time (EAT)</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="America/New_York">New York (EST)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
            <select
              value={settings.regional.dateFormat}
              onChange={(e) => handleSelect('regional', 'dateFormat', e.target.value)}
              className="input w-full"
              aria-label="Select date format"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={settings.regional.currency}
              onChange={(e) => handleSelect('regional', 'currency', e.target.value)}
              className="input w-full"
              aria-label="Select currency"
            >
              <option value="KES">Kenyan Shilling (KES)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrganization = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          ⚠️ These settings affect all users in the organization. Changes here will be applied globally.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
            <input
              type="text"
              defaultValue="KAL Engineering Services Ltd"
              className="input w-full"
              placeholder="Organization name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
            <select className="input w-full" defaultValue="KES" aria-label="Select default currency">
              <option value="KES">Kenyan Shilling (KES)</option>
              <option value="USD">US Dollar (USD)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Settings for New Users</h3>
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Configure default settings that will be applied to all new user accounts.
          </p>
          <button className="btn-secondary">Configure Defaults</button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'notifications':
        return renderNotifications();
      case 'appearance':
        return renderAppearance();
      case 'privacy':
        return renderPrivacy();
      case 'regional':
        return renderRegional();
      case 'organization':
        return renderOrganization();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="card p-2 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={activeSection === section.id ? 'text-primary-600' : 'text-gray-400'}>
                  {section.icon}
                </span>
                <div>
                  <p className="font-medium">{section.title}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">{section.description}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="card p-6"
          >
            {renderContent()}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
              <button className="btn-secondary">Cancel</button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
