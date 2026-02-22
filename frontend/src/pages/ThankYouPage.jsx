import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Clock, Users, Star, ChevronRight, Shield, Gift, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const ThankYouPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [leadData, setLeadData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('leadData');
    if (data) setLeadData(JSON.parse(data));
  }, []);

  const courseFeatures = [
    t.courseFeature1, t.courseFeature2, t.courseFeature3,
    t.courseFeature4, t.courseFeature5, t.courseFeature6
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] grain-overlay" data-testid="thank-you-page">
      <LanguageSwitcher />
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-20">
        {/* Success Message */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" strokeWidth={3} />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-stone-900 mb-4" data-testid="success-title">
            {t.thankYouTitle} {leadData?.name || ''}!
          </h1>
          <p className="text-lg text-stone-600 max-w-lg mx-auto">{t.thankYouSubtitle}</p>
        </div>

        {/* Two Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Basic */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-stone-600" />
              </div>
              <span className="text-sm font-medium text-stone-500 uppercase tracking-wide">{t.basicTag}</span>
            </div>
            <h3 className="font-heading text-xl font-semibold text-stone-900 mb-3">{t.basicTitle}</h3>
            <p className="text-stone-600 mb-4">{t.basicDesc}</p>
            <ul className="space-y-2 mb-6">
              {[t.basicItem1, t.basicItem2, t.basicItem3].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-stone-600 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />{item}
                </li>
              ))}
            </ul>
            <p className="text-stone-400 text-sm">{t.basicCheck} {leadData?.email && `(${leadData.email})`}</p>
          </div>

          {/* Full - highlighted */}
          <div className="bg-white rounded-2xl border-2 border-[#064E3B] p-6 md:p-8 relative">
            <div className="absolute -top-3 left-6 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
              {t.recommended}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Gift className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide">{t.fullTag}</span>
            </div>
            <h3 className="font-heading text-xl font-semibold text-stone-900 mb-3">{t.fullTitle}</h3>
            <p className="text-stone-600 mb-4">{t.fullDesc}</p>
            <ul className="space-y-2 mb-6">
              {[t.fullItem1, t.fullItem2, t.fullItem3].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-stone-700 text-sm font-medium">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />{item}
                </li>
              ))}
            </ul>
            <div className="flex items-baseline gap-2">
              <span className="text-stone-400 line-through">$99</span>
              <span className="text-2xl font-bold text-stone-900">$50</span>
              <span className="text-emerald-600 text-sm">{t.discount}</span>
            </div>
          </div>
        </div>

        {/* Main CTA Card */}
        <div className="bg-[#064E3B] rounded-2xl p-8 md:p-10 text-white" data-testid="course-card">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">{t.courseTitle}</h2>
            <p className="text-emerald-200">{t.courseSubtitle}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {courseFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span className="text-sm text-emerald-100">{feature}</span>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-y border-emerald-700/50 mb-8">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-300" />
              <span className="text-emerald-100">847 {t.students}</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              <span className="text-emerald-100 ml-1">4.9</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-300" />
              <span className="text-emerald-100">{t.accessForever}</span>
            </div>
          </div>

          {/* CTA */}
          <button
            data-testid="buy-course-button"
            className="w-full bg-white text-[#064E3B] hover:bg-emerald-50 rounded-full px-8 py-4 text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {t.buyCourse}
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-2 mt-6 text-emerald-200">
            <Shield className="w-5 h-5" />
            <p className="text-sm">{t.guarantee}</p>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-8 bg-stone-100 rounded-xl p-6 text-center">
          <p className="text-stone-600 italic mb-3">{t.testimonialQuote}</p>
          <p className="text-stone-500 text-sm">{t.testimonialAuthor}</p>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-stone-400 hover:text-stone-600 text-sm transition-colors inline-flex items-center gap-1"
            data-testid="skip-button"
          >
            {t.backToHome}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
