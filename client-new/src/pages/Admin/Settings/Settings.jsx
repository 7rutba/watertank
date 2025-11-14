import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import api from '../../../utils/api';

const Settings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [activeCategory, setActiveCategory] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const categories = [
    { key: 'general', label: t('admin.generalSettings'), icon: '⚙️' },
    { key: 'email', label: t('admin.emailSettings'), icon: '📧' },
    { key: 'sms', label: t('admin.smsSettings'), icon: '💬' },
    { key: 'payment', label: t('admin.paymentSettings'), icon: '💳' },
    { key: 'system', label: t('admin.systemSettings'), icon: '🖥️' },
    { key: 'notification', label: t('admin.notificationSettings'), icon: '🔔' },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Initialize default settings if they don't exist
      if (error.response?.status === 404) {
        try {
          await api.get('/admin/settings/initialize');
          const response = await api.get('/admin/settings');
          setSettings(response.data);
        } catch (initError) {
          console.error('Error initializing settings:', initError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory]?.map((setting) =>
        setting.key === key ? { ...setting, value } : setting
      ),
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const categorySettings = settings[activeCategory] || [];
      const updates = categorySettings.map(({ key, value }) => ({ key, value }));
      
      await api.put('/admin/settings', { settings: updates });
      setHasChanges(false);
      alert(t('admin.settingsSaved'));
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInitialize = async () => {
    if (!window.confirm('This will reset all settings to default values. Continue?')) return;
    
    try {
      await api.post('/admin/settings/initialize');
      await fetchSettings();
      alert('Settings initialized successfully');
    } catch (error) {
      console.error('Error initializing settings:', error);
      alert('Failed to initialize settings');
    }
  };

  const renderSettingInput = (setting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={setting.value === true || setting.value === 'true'}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">{setting.label}</span>
          </label>
        );
      case 'number':
        return (
          <Input
            label={setting.label}
            type="number"
            value={setting.value || ''}
            onChange={(e) => handleSettingChange(setting.key, parseFloat(e.target.value) || 0)}
            className="mb-0"
          />
        );
      default:
        return (
          <Input
            label={setting.label}
            type={setting.key.includes('password') || setting.key.includes('secret') ? 'password' : 'text'}
            value={setting.value || ''}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            placeholder={setting.description}
            className="mb-0"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('admin.settings')}</h1>
        </div>
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </Card>
      </div>
    );
  }

  const categorySettings = settings[activeCategory] || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('admin.settings')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Configure platform settings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleInitialize} variant="outline" size="small">
            {t('admin.initializeSettings')}
          </Button>
          {hasChanges && (
            <Button onClick={handleSave} variant="primary" disabled={saving}>
              {saving ? t('common.loading') : t('admin.saveSettings')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeCategory === category.key
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium">{category.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {categories.find((c) => c.key === activeCategory)?.label}
            </h2>
            {categorySettings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No settings found for this category</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categorySettings.map((setting) => (
                  <div key={setting.key}>
                    {setting.description && (
                      <p className="text-xs text-gray-500 mb-1">{setting.description}</p>
                    )}
                    {renderSettingInput(setting)}
                  </div>
                ))}
                {hasChanges && (
                  <div className="pt-4 border-t">
                    <Button onClick={handleSave} variant="primary" className="w-full sm:w-auto" disabled={saving}>
                      {saving ? t('common.loading') : t('admin.saveSettings')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;

