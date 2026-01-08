import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Phone } from 'lucide-react';
import heroImage from '../assets/hero/contactUsHero.jpg';

export default function ContactUs() {
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
            {t('contactUs.title')}
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            {t('contactUs.subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-2">
              {t('contactUs.getInTouch')}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t('contactUs.haveQuestion')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('contactUs.haveQuestionDesc')}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-primary-100 rounded-xl mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">{t('contactUs.address')}</p>
              <p className="text-gray-600">Sofia, Bulgaria</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-primary-100 rounded-xl mb-4">
                <Mail className="h-8 w-8 text-primary-600" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">{t('contactUs.email')}</p>
              <p className="text-gray-600">support@cartify.com</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-primary-100 rounded-xl mb-4">
                <Phone className="h-8 w-8 text-primary-600" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">{t('contactUs.phone')}</p>
              <p className="text-gray-600">+359 123 456 789</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
