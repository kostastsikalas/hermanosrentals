import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const TermsPage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">
            {t('termsPage.title')}
          </h1>
          
          <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">{t('termsPage.section1.title')}</h2>
              <p>{t('termsPage.section1.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">{t('termsPage.section2.title')}</h2>
              <p>{t('termsPage.section2.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">{t('termsPage.section3.title')}</h2>
              <p>{t('termsPage.section3.content')}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">{t('termsPage.section4.title')}</h2>
              <p>{t('termsPage.section4.content')}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
