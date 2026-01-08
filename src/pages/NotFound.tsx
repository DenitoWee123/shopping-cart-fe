import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{t('errors.notFound')}</h2>
        <p className="text-gray-600 mb-8">
          {t('errors.notFoundDesc')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors"
        >
          <Home className="h-5 w-5 mr-2" />
          {t('nav.home')}
        </Link>
      </div>
    </div>
  );
}
