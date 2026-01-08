import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import heroImage from '../assets/hero/homeHero.jpg';
import aboutHeroImage from '../assets/hero/aboutUsHero.jpg';
import contactHeroImage from '../assets/hero/contactUsHero.jpg';
import cartImage from '../assets/home/cart.png';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const scrollToSections = () => {
    const sectionsElement = document.getElementById('features-section');
    if (sectionsElement) {
      sectionsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      <div 
        className="relative min-h-[70vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('home.title')}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
            {t('home.subtitle')}
          </p>
          <button
            onClick={scrollToSections}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 rounded-lg transition-colors shadow-lg"
          >
            {t('common.getStarted')}
            <ChevronDown className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      <div id="features-section" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {t('home.carts')}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t('home.cartsDesc')}
              </p>
              {user ? (
                <Link
                  to="/carts"
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white active:bg-gray-800 transition-colors"
                >
                  {t('common.getStarted')}
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white active:bg-gray-800 transition-colors"
                >
                  {t('common.signUp')}
                </Link>
              )}
            </div>
            
            <div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={cartImage} 
                  alt={t('nav.carts')}
                  className="w-full h-64 lg:h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={aboutHeroImage} 
                    alt={t('nav.aboutUs')}
                    className="w-full h-64 lg:h-80 object-cover"
                  />
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {t('home.aboutUs')}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {t('home.aboutUsDesc')}
                </p>
                <Link
                  to="/about"
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white active:bg-gray-800 transition-colors"
                >
                  {t('common.learnMore')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {t('home.contactUs')}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {t('home.contactUsDesc')}
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white active:bg-gray-800 transition-colors"
                >
                  {t('contactUs.getInTouch')}
                </Link>
              </div>
              
              <div>
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={contactHeroImage} 
                    alt={t('nav.contactUs')}
                    className="w-full h-64 lg:h-80 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
