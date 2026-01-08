import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Globe } from 'lucide-react';
import logo from '../assets/logo.png';
import ConfirmDialog from './ConfirmDialog';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/carts', label: t('nav.carts') },
    { path: '/about', label: t('nav.aboutUs') },
    { path: '/contact', label: t('nav.contactUs') },
  ];

  const currentLangLabel = i18n.language === 'bg' ? '🇧🇬 Български' : '🇬🇧 English';

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <img src={logo} alt={t('common.appName')} className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">{t('common.appName')}</span>
            </Link>

            <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActivePath(link.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600 active:bg-primary-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center">
              <div className="relative mr-4">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  title={t('profile.language')}
                >
                  <Globe className="h-5 w-5 text-gray-600" />
                </button>

                {isLangDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsLangDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          i18n.language === 'en'
                            ? 'bg-primary-50 text-primary-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                      <button
                        onClick={() => changeLanguage('bg')}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          i18n.language === 'bg'
                            ? 'bg-primary-50 text-primary-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        🇧🇬 Български
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Auth Section */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user.username.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.username}
                    </span>
                  </button>

                  {isUserDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                        >
                          {t('common.profile')}
                        </Link>
                        <button
                          onClick={handleLogoutClick}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                        >
                          {t('common.signOut')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                  >
                    {t('common.signIn')}
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 rounded-lg transition-colors"
                  >
                    {t('common.signUp')}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button Only */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu - All in one dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              {/* Navigation Links Section */}
              <div className="space-y-1 pb-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActivePath(link.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600 active:bg-primary-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Account Section - Simplified */}
              {user ? (
                <div className="border-t border-gray-200 pt-4 pb-4 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                  >
                    {t('common.profile')}
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                  >
                    {t('common.signOut')}
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 pb-4 space-y-2 px-4">
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg text-base font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                  >
                    {t('common.signIn')}
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg text-base font-medium bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700"
                  >
                    {t('common.signUp')}
                  </button>
                </div>
              )}

              {/* Language Section - Globe style like Udemy */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => changeLanguage(i18n.language === 'en' ? 'bg' : 'en')}
                  className="flex items-center mx-4 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <Globe className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">{currentLangLabel}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title={t('auth.logoutConfirmTitle')}
        message={t('auth.logoutConfirmMessage')}
      />
    </>
  );
}
