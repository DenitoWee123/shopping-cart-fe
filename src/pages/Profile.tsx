import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Shield, CheckCircle, AlertCircle, X, Eye, EyeOff, Loader2 } from 'lucide-react';

type TabType = 'profile' | 'security';

export default function Profile() {
  const { t } = useTranslation();
  const { user, changeUsername, changePassword } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentTab = (searchParams.get('tab') as TabType) || 'profile';
  
  const [newUsername, setNewUsername] = useState('');
  const [usernamePassword, setUsernamePassword] = useState('');
  const [showUsernamePassword, setShowUsernamePassword] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
    setMessage(null);
    setNewUsername('');
    setUsernamePassword('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newUsername.length < 3) {
      setMessage({ type: 'error', text: t('profile.usernameTooShort') });
      return;
    }

    if (!usernamePassword) {
      setMessage({ type: 'error', text: t('profile.allFieldsRequired') });
      return;
    }

    setIsChangingUsername(true);

    try {
      const result = await changeUsername(usernamePassword, newUsername);
      
      if (result.success) {
        setMessage({ type: 'success', text: t('profile.usernameUpdated') });
        setNewUsername('');
        setUsernamePassword('');
      } else {
        setMessage({ type: 'error', text: result.error || t('profile.updateFailed') });
      }
    } catch {
      setMessage({ type: 'error', text: t('profile.updateFailed') });
    } finally {
      setIsChangingUsername(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: t('profile.allFieldsRequired') });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: t('profile.passwordTooShort') });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: t('profile.passwordsDoNotMatch') });
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword(currentPassword, newPassword, confirmPassword);
      
      if (result.success) {
        setMessage({ type: 'success', text: t('profile.passwordUpdated') });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: result.error || t('profile.currentPasswordWrong') });
      }
    } catch {
      setMessage({ type: 'error', text: t('profile.updateFailed') });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'profile' as TabType, label: t('profile.publicProfile'), icon: User },
    { id: 'security' as TabType, label: t('profile.accountSecurity'), icon: Shield },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Sidebar */}
            <div className="lg:w-72 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 p-6">
              {/* Profile Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {getInitials(user.username)}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{user.username}</h2>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 lg:p-8">
              {/* Message */}
              {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm flex-1 ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {message.text}
                  </p>
                  <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Public Profile Tab */}
              {currentTab === 'profile' && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">{t('profile.publicProfile')}</h1>
                    <p className="text-gray-500 mt-1">{t('profile.publicProfileDesc')}</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('profile.basics')}</h3>
                      
                      {/* Current Username Display */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('auth.username')}
                        </label>
                        <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
                          <span className="text-gray-900 font-medium">{user.username}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{t('profile.usernameHint')}</p>
                      </div>

                      {/* Change Username Form */}
                      <form onSubmit={handleUsernameChange} className="border border-gray-200 rounded-lg p-4 space-y-4">
                        <h4 className="font-medium text-gray-900">{t('profile.changeUsername')}</h4>
                        
                        <div>
                          <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('profile.newUsername')}
                          </label>
                          <input
                            id="newUsername"
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            placeholder={t('profile.enterNewUsername')}
                          />
                        </div>

                        <div>
                          <label htmlFor="usernamePassword" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('profile.passwordToConfirm')}
                          </label>
                          <div className="relative">
                            <input
                              id="usernamePassword"
                              type={showUsernamePassword ? 'text' : 'password'}
                              value={usernamePassword}
                              onChange={(e) => setUsernamePassword(e.target.value)}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                              placeholder={t('profile.enterPasswordToConfirm')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowUsernamePassword(!showUsernamePassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showUsernamePassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isChangingUsername || !newUsername || !usernamePassword}
                          className="px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {isChangingUsername ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                          ) : (
                            t('profile.changeUsername')
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {currentTab === 'security' && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">{t('profile.account')}</h1>
                    <p className="text-gray-500 mt-1">{t('profile.accountDesc')}</p>
                  </div>

                  <div className="space-y-8">
                    {/* Email Section */}
                    <div className="pb-6 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('auth.email')}</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 px-4 py-3 bg-primary-50 border border-primary-200 rounded-lg">
                          <span className="text-gray-500 text-sm">{t('profile.yourEmailIs')} </span>
                          <span className="text-gray-900 font-medium">{user.email}</span>
                        </div>
                      </div>
                      <p className="text-xs text-primary-600 mt-2">{t('profile.emailCannotChange')}</p>
                    </div>

                    {/* Password Change Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('profile.changePassword')}</h3>
                      
                      <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('profile.currentPassword')}
                          </label>
                          <div className="relative">
                            <input
                              id="currentPassword"
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                              placeholder={t('profile.enterCurrentPassword')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showCurrentPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('profile.newPassword')}
                          </label>
                          <div className="relative">
                            <input
                              id="newPassword"
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                              placeholder={t('profile.enterNewPassword')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showNewPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('profile.confirmNewPassword')}
                          </label>
                          <div className="relative">
                            <input
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                              placeholder={t('profile.retypeNewPassword')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                          className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {isChangingPassword ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                          ) : (
                            t('profile.changePassword')
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
