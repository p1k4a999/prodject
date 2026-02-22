import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Gift, ArrowRight, Clock, Users, Star, ChevronRight, Download, Mail } from 'lucide-react';

const ThankYouPage = () => {
  const navigate = useNavigate();
  const [leadData, setLeadData] = useState(null);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('leadData');
    if (data) {
      setLeadData(JSON.parse(data));
    }
    // Show upsell after 2 seconds
    const timer = setTimeout(() => setShowUpsell(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const courseFeatures = [
    'Полный видеокурс (12 уроков)',
    'Шаблоны для портфолио',
    'Список 50+ бирж фриланса',
    'Скрипты для клиентов',
    'Доступ в закрытый чат',
    'Личная консультация 30 мин'
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] grain-overlay" data-testid="thank-you-page">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-20">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" strokeWidth={3} />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-stone-900 mb-4" data-testid="success-title">
            Отлично, {leadData?.name || 'друг'}!
          </h1>
          <p className="text-lg text-stone-600 max-w-lg mx-auto">
            Ваш пошаговый план уже отправлен на <span className="font-medium text-stone-900">{leadData?.email || 'вашу почту'}</span>
          </p>
        </div>

        {/* Plan Preview Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 mb-8" data-testid="plan-preview">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Download className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-stone-900">Ваш план готов</h3>
              <p className="text-stone-500">Проверьте почту или папку "Спам"</p>
            </div>
          </div>
          <div className="bg-stone-50 rounded-xl p-6">
            <p className="text-stone-600 mb-4">В плане вы найдёте:</p>
            <ul className="space-y-3">
              {['5 направлений для старта без опыта', 'Чек-лист первых шагов', 'Список бесплатных ресурсов'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-stone-700">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Email reminder */}
        <div className="flex items-center justify-center gap-3 text-stone-500 mb-12">
          <Mail className="w-5 h-5" />
          <p className="text-sm">Не нашли письмо? Проверьте папку "Спам" или "Промоакции"</p>
        </div>

        {/* Upsell Section */}
        {showUpsell && (
          <div className="animate-fade-in" data-testid="upsell-section">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Gift className="w-4 h-4" />
                Специальное предложение
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-semibold text-stone-900 mb-3">
                Хотите результат быстрее?
              </h2>
              <p className="text-stone-600">Полный курс поможет выйти на доход за 2-4 недели</p>
            </div>

            {/* Course Card */}
            <div className="bg-white rounded-2xl border-2 border-[#064E3B] shadow-xl overflow-hidden" data-testid="course-card">
              {/* Header */}
              <div className="bg-[#064E3B] text-white p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-heading text-2xl font-bold mb-2">Фриланс Старт PRO</h3>
                    <p className="text-emerald-200">Полная система выхода на удалённый доход</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-2">
                      <span className="text-stone-400 line-through text-lg">$99</span>
                      <span className="text-4xl font-bold">$50</span>
                    </div>
                    <span className="text-emerald-200 text-sm">Скидка 50% сегодня</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {courseFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-stone-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Social Proof */}
                <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-y border-stone-100 mb-8">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-stone-400" />
                    <span className="text-stone-600">847 учеников</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-stone-600 ml-1">4.9</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-stone-400" />
                    <span className="text-stone-600">Доступ навсегда</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  data-testid="buy-course-button"
                  className="w-full bg-[#064E3B] text-white hover:bg-[#064E3B]/90 rounded-full px-8 py-4 text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  Получить курс за $50
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-sm text-stone-500 mt-4">
                  Гарантия возврата 14 дней, если курс не подойдёт
                </p>
              </div>
            </div>

            {/* Skip link */}
            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/')}
                className="text-stone-500 hover:text-stone-700 text-sm transition-colors inline-flex items-center gap-1"
                data-testid="skip-button"
              >
                Вернуться на главную
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add fade-in animation */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ThankYouPage;
