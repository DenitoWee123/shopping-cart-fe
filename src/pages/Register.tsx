import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Copy, Check, Shield, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { t } = useTranslation();
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, username, password, confirmPassword);
      if (result.success && result.recoveryCode) {
        setRecoveryCode(result.recoveryCode);
      } else if (result.success) {
        navigate('/login');
      } else {
        setError(result.error || t('auth.registrationFailed'));
      }
    } catch {
      setError(t('auth.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryCode = () => {
    if (recoveryCode) {
      navigator.clipboard.writeText(recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinueToLogin = () => {
    navigate('/login');
  };

  // Show recovery code screen after successful registration
  if (recoveryCode) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-sm p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              {t('auth.registrationSuccess')}
            </h2>
            <p className="text-center text-gray-600 mb-6">
              {t('auth.saveRecoveryCodeDesc')}
            </p>

            {/* Warning Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  {t('auth.recoveryCodeWarning')}
                </p>
              </div>
            </div>

            {/* Recovery Code Display */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                {t('auth.recoveryCode')}
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-center text-lg font-mono font-bold text-gray-900 bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 tracking-wider">
                  {recoveryCode}
                </code>
                <button
                  onClick={copyRecoveryCode}
                  className="flex-shrink-0 p-3 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                  title={t('common.copy')}
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {t('auth.recoveryCodeHint')}
              </p>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinueToLogin}
              className="w-full px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors"
            >
              {t('auth.continueToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {t('auth.registerTitle')}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder={t('auth.email')}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.username')}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder={t('auth.username')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder={t('auth.password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder={t('auth.confirmPassword')}
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
              disabled={loading}
              className="w-full px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('common.loading') : t('common.signUp')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              {t('common.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
