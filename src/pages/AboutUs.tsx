import { useTranslation } from 'react-i18next';
import { Target, Eye, Heart } from 'lucide-react';
import heroImage from '../assets/hero/aboutUsHero.jpg';

export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div 
        className="relative min-h-[50vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            {t('aboutUs.title')}
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            {t('aboutUs.subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary-100 rounded-full">
                  <Target className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {t('aboutUs.mission')}
              </h2>
              <p className="text-gray-600 text-center">
                {t('aboutUs.missionDesc')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary-100 rounded-full">
                  <Eye className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {t('aboutUs.vision')}
              </h2>
              <p className="text-gray-600 text-center">
                {t('aboutUs.visionDesc')}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary-100 rounded-full">
                  <Heart className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                {t('aboutUs.values')}
              </h2>
              <p className="text-gray-600 text-center">
                {t('aboutUs.valuesDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
