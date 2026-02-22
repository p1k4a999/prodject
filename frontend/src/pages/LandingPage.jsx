import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, AlertCircle, ArrowRight, Users, Target, Lightbulb, Shield, Clock, TrendingUp, Quote } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Hero Section
const HeroSection = ({ scrollToForm }) => (
  <section data-testid="hero-section" className="min-h-[90vh] flex items-center py-12 md:py-20">
    <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Content */}
        <div className="order-2 lg:order-1">
          <span className="inline-block text-sm uppercase tracking-widest text-stone-500 mb-4 font-medium">
            Пошаговая система для новичков
          </span>
          <h1 data-testid="hero-title" className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-6">
            Как начать зарабатывать онлайн <span className="text-[#059669]">без опыта</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-600 leading-relaxed mb-8 max-w-xl">
            Получите личный план старта во фрилансе. Конкретные шаги, проверенные ниши, реальные стратегии поиска первых клиентов.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              data-testid="hero-cta-button"
              onClick={scrollToForm}
              className="bg-[#064E3B] text-white hover:bg-[#064E3B]/90 rounded-full px-8 py-4 text-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              Получить пошаговый план
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          {/* Micro-proof - Trust indicators */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-stone-200">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
              </div>
              <span className="text-stone-600 text-sm font-medium">2,400+ получили план</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
              <span className="text-stone-600 text-sm ml-1">4.9 рейтинг</span>
            </div>
          </div>
        </div>
        {/* Right: Image - человек за ноутбуком */}
        <div className="order-1 lg:order-2">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-100 to-amber-50 rounded-3xl -z-10" />
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
              alt="Фрилансер работает удалённо"
              className="rounded-2xl shadow-2xl shadow-stone-300/50 w-full object-cover aspect-[4/3]"
            />
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border border-stone-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">Первый заказ</p>
                  <p className="text-xs text-stone-500">через 2 недели</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Problems Section
const ProblemsSection = () => {
  const problems = [
    {
      icon: AlertCircle,
      title: 'Нет понимания с чего начать',
      description: 'Слишком много информации, непонятно что реально работает'
    },
    {
      icon: Shield,
      title: 'Страх обмана и мошенников',
      description: 'В интернете много фейков и "схем быстрого заработка"'
    },
    {
      icon: Clock,
      title: 'Нет времени разбираться',
      description: 'Хочется готовый план действий, а не месяцы поисков'
    }
  ];

  return (
    <section data-testid="problems-section" className="py-20 md:py-32 bg-stone-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-sm uppercase tracking-widest text-stone-500 mb-4 block">Знакомо?</span>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-stone-900 leading-tight">
            Почему большинство <span className="text-[#D97706]">не стартуют</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              data-testid={`problem-card-${index}`}
              className="bg-white rounded-2xl border border-stone-200 p-8 md:p-10 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
                <problem.icon className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-stone-900 mb-3">{problem.title}</h3>
              <p className="text-stone-600 leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Benefits Section
const BenefitsSection = () => {
  const benefits = [
    {
      icon: Target,
      title: 'Список направлений',
      description: 'Узнаете какие ниши подходят для старта без опыта',
      size: 'large'
    },
    {
      icon: Users,
      title: 'Как искать заказы',
      description: 'Где найти первых клиентов уже на этой неделе',
      size: 'small'
    },
    {
      icon: Lightbulb,
      title: 'Реальные шаги',
      description: 'Конкретный план действий на первый месяц',
      size: 'small'
    },
    {
      icon: TrendingUp,
      title: 'Стратегия роста',
      description: 'Как выйти на стабильный доход от 50,000₽ в месяц',
      size: 'large'
    }
  ];

  return (
    <section data-testid="benefits-section" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-sm uppercase tracking-widest text-stone-500 mb-4 block">Что вы получите</span>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-stone-900 leading-tight">
            Всё что нужно для <span className="text-[#059669]">уверенного старта</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              data-testid={`benefit-card-${index}`}
              className={`bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-8 md:p-10 ${
                benefit.size === 'large' ? 'md:col-span-1' : ''
              }`}
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
                <benefit.icon className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-stone-900 mb-3">{benefit.title}</h3>
              <p className="text-stone-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section with Auto-rotating Carousel
const TestimonialsSection = () => {
  // Большой пул отзывов - 24 человека
  const allTestimonials = [
    {
      name: 'Анна К.',
      role: 'Копирайтер',
      text: 'Скептически относилась к "заработку в интернете", но план реально работает. Через 3 недели получила первый заказ на 15,000₽',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      result: '+45,000₽/мес'
    },
    {
      name: 'Михаил Д.',
      role: 'Веб-дизайнер',
      text: 'Работал на заводе, хотел сменить профессию. План помог понять куда двигаться. Сейчас зарабатываю больше, работая из дома',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      result: '+80,000₽/мес'
    },
    {
      name: 'Елена В.',
      role: 'Виртуальный ассистент',
      text: 'Мама в декрете, искала подработку. Нашла своё направление и теперь работаю 4 часа в день. Идеально!',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      result: '+35,000₽/мес'
    },
    {
      name: 'Дмитрий С.',
      role: 'SMM-специалист',
      text: 'Думал что фриланс — это сложно. Оказалось, нужен просто чёткий план. За месяц вышел на первые заказы',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      result: '+55,000₽/мес'
    },
    {
      name: 'Ольга М.',
      role: 'Контент-менеджер',
      text: 'Уволилась с офиса и не пожалела. План дал структуру и уверенность. Теперь сама выбираю с кем работать',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      result: '+62,000₽/мес'
    },
    {
      name: 'Артём Н.',
      role: 'Видеомонтажёр',
      text: 'Начал как хобби, теперь это основной доход. Самое ценное — понял как правильно искать клиентов',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      result: '+90,000₽/мес'
    },
    {
      name: 'Наталья П.',
      role: 'Переводчик',
      text: 'Знала английский, но не знала как монетизировать. План открыл глаза на возможности. Спасибо!',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      result: '+70,000₽/мес'
    },
    {
      name: 'Игорь Л.',
      role: 'Таргетолог',
      text: 'Прошёл кучу курсов, но только здесь получил реальные шаги. Через 2 недели — первый клиент',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      result: '+120,000₽/мес'
    },
    {
      name: 'Марина Т.',
      role: 'Иллюстратор',
      text: 'Рисовала для себя, теперь рисую за деньги. План помог выстроить позиционирование и найти нишу',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      result: '+58,000₽/мес'
    },
    {
      name: 'Алексей Р.',
      role: 'Разработчик',
      text: 'Работал в найме за копейки. Фриланс дал свободу и х3 к доходу. Жалею что не начал раньше',
      image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
      result: '+150,000₽/мес'
    },
    {
      name: 'Виктория К.',
      role: 'Дизайнер презентаций',
      text: 'Нашла узкую нишу благодаря плану. Конкуренции мало, заказов много. Очень довольна!',
      image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
      result: '+48,000₽/мес'
    },
    {
      name: 'Сергей Б.',
      role: 'Копирайтер',
      text: 'Начинал с текстов по 500₽. Сейчас минимальный заказ — 10,000₽. План научил ценить свою работу',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
      result: '+75,000₽/мес'
    },
    {
      name: 'Кристина Ж.',
      role: 'UX-дизайнер',
      text: 'Была менеджером в банке. За 2 месяца освоила новую профессию и вышла на удалёнку. Лучшее решение!',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      result: '+95,000₽/мес'
    },
    {
      name: 'Павел Г.',
      role: 'Motion-дизайнер',
      text: 'Делал видео для друзей бесплатно. Теперь это полноценный бизнес. План показал как продавать себя',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
      result: '+110,000₽/мес'
    },
    {
      name: 'Диана С.',
      role: 'Фотограф',
      text: 'Снимала только для себя. Сейчас веду съёмки каждую неделю. План помог найти первых клиентов',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
      result: '+65,000₽/мес'
    },
    {
      name: 'Роман К.',
      role: 'SEO-специалист',
      text: 'Учился сам по YouTube. Но только план дал системный подход. Первый клиент — через 10 дней',
      image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop&crop=face',
      result: '+85,000₽/мес'
    },
    {
      name: 'Александра Н.',
      role: 'Email-маркетолог',
      text: 'Нишу подсказал план — email-маркетинг. Думала это сложно, оказалось — самое востребованное',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
      result: '+72,000₽/мес'
    },
    {
      name: 'Владимир Ч.',
      role: 'Продуктовый дизайнер',
      text: 'Работал в офисе 5/2. Сейчас работаю когда хочу, зарабатываю в 2 раза больше. Свобода!',
      image: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150&h=150&fit=crop&crop=face',
      result: '+130,000₽/мес'
    },
    {
      name: 'Юлия Ф.',
      role: 'Редактор',
      text: 'Редактировала тексты на работе за 40к. Сейчас делаю то же самое удалённо за 90к. Почему не раньше?',
      image: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=150&h=150&fit=crop&crop=face',
      result: '+90,000₽/мес'
    },
    {
      name: 'Андрей М.',
      role: 'Консультант',
      text: 'Эксперт в своей теме, но не знал как продавать знания. План показал как упаковать опыт',
      image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face',
      result: '+200,000₽/мес'
    },
    {
      name: 'Татьяна Л.',
      role: 'Бухгалтер на удалёнке',
      text: 'Думала бухгалтерия — это только офис. Ошибалась! Теперь веду 5 компаний из дома',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face',
      result: '+78,000₽/мес'
    },
    {
      name: 'Максим В.',
      role: '3D-визуализатор',
      text: 'Архитектор по образованию. Ушёл в 3D на фриланс — доход вырос в 4 раза за полгода',
      image: 'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=150&h=150&fit=crop&crop=face',
      result: '+180,000₽/мес'
    },
    {
      name: 'Евгения Р.',
      role: 'Методолог онлайн-курсов',
      text: 'Была учителем в школе. Нашла свою нишу — создание образовательных программ. Доход х5!',
      image: 'https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?w=150&h=150&fit=crop&crop=face',
      result: '+100,000₽/мес'
    },
    {
      name: 'Денис П.',
      role: 'Аналитик данных',
      text: 'IT без программирования — это реально. План помог найти нишу аналитика. Очень благодарен!',
      image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
      result: '+140,000₽/мес'
    }
  ];

  const [currentSet, setCurrentSet] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Разбиваем на группы по 3
  const testimonialSets = [];
  for (let i = 0; i < allTestimonials.length; i += 3) {
    testimonialSets.push(allTestimonials.slice(i, i + 3));
  }

  // Автоматическая смена каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSet((prev) => (prev + 1) % testimonialSets.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonialSets.length]);

  const currentTestimonials = testimonialSets[currentSet];

  return (
    <section data-testid="testimonials-section" className="py-20 md:py-32 bg-stone-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-sm uppercase tracking-widest text-stone-500 mb-4 block">Отзывы</span>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-stone-900 leading-tight">
            Они уже <span className="text-[#059669]">начали зарабатывать</span>
          </h2>
        </div>
        
        {/* Animated testimonials grid */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 ${
            isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
          }`}
        >
          {currentTestimonials.map((testimonial, index) => (
            <div
              key={`${currentSet}-${index}`}
              data-testid={`testimonial-card-${index}`}
              className="bg-white rounded-2xl border border-stone-100 p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <Quote className="w-8 h-8 text-emerald-200 mb-4" />
              <p className="text-stone-700 leading-relaxed flex-grow mb-6">"{testimonial.text}"</p>
              <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-stone-900">{testimonial.name}</p>
                    <p className="text-sm text-stone-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full">
                    {testimonial.result}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonialSets.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentSet(index);
                  setIsAnimating(false);
                }, 300);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSet 
                  ? 'bg-emerald-600 w-6' 
                  : 'bg-stone-300 hover:bg-stone-400'
              }`}
              aria-label={`Показать отзывы ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-16 pt-16 border-t border-stone-200">
          <div className="text-center">
            <p className="font-heading text-4xl md:text-5xl font-bold text-stone-900">2,400+</p>
            <p className="text-stone-500 mt-2">Получили план</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-4xl md:text-5xl font-bold text-[#059669]">78%</p>
            <p className="text-stone-500 mt-2">Нашли заказы</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-4xl md:text-5xl font-bold text-stone-900">47K₽</p>
            <p className="text-stone-500 mt-2">Средний доход</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Creator/Author Section - Trust Block
const CreatorSection = () => (
  <section data-testid="creator-section" className="py-16 md:py-24">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face"
              alt="Автор плана"
              className="w-32 h-32 rounded-full object-cover border-4 border-emerald-100"
            />
          </div>
          <div className="text-center md:text-left">
            <span className="text-sm uppercase tracking-widest text-stone-500 mb-2 block">Кто стоит за планом</span>
            <h3 className="font-heading text-2xl font-semibold text-stone-900 mb-3">Александр Петров</h3>
            <p className="text-stone-600 leading-relaxed mb-4">
              5 лет во фрилансе. Прошёл путь от первого заказа за 500₽ до стабильных 300,000₽/мес. 
              Помог 2,400+ людям начать зарабатывать удалённо. Знаю все подводные камни и делюсь только проверенными методами.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-stone-500">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" />
                5 лет опыта
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" />
                2,400+ учеников
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" />
                300K₽/мес доход
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Lead Form Section
const LeadFormSection = ({ formRef }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Введите ваше имя';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/leads`, formData);
      toast.success('Отлично! Переходим к оформлению...');
      // Store lead data for thank you page
      localStorage.setItem('leadData', JSON.stringify(response.data));
      navigate('/thank-you');
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Произошла ошибка. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={formRef} data-testid="lead-form-section" className="py-20 md:py-32 bg-stone-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm uppercase tracking-widest text-stone-500 mb-4 block">Следующий шаг</span>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-stone-900 leading-tight mb-4">
              Получите личный план старта
            </h2>
            <p className="text-lg text-stone-600">Оставьте контакты и откройте пошаговую систему входа во фриланс</p>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 shadow-lg p-8 md:p-10" data-testid="lead-form">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">Ваше имя</label>
                <input
                  type="text"
                  id="name"
                  data-testid="input-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-stone-50 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-none transition-all placeholder:text-stone-400 text-stone-900 ${
                    errors.name ? 'border-red-400' : 'border-stone-200'
                  }`}
                  placeholder="Как вас зовут?"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  data-testid="input-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-stone-50 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-none transition-all placeholder:text-stone-400 text-stone-900 ${
                    errors.email ? 'border-red-400' : 'border-stone-200'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              {/* Phone (optional) */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">
                  Телефон <span className="text-stone-400">(необязательно)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  data-testid="input-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-none transition-all placeholder:text-stone-400 text-stone-900"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              
              {/* Submit */}
              <button
                type="submit"
                data-testid="submit-button"
                disabled={loading}
                className="w-full bg-[#064E3B] text-white hover:bg-[#064E3B]/90 rounded-full px-8 py-4 text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Открываем доступ...
                  </span>
                ) : (
                  <>
                    Открыть пошаговую систему
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
            
            <p className="text-center text-sm text-stone-500 mt-6">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => (
  <footer className="py-12 border-t border-stone-200">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-stone-500 text-sm">© 2025 Фриланс Старт. Все права защищены.</p>
        <div className="flex gap-6">
          <a href="#" className="text-stone-500 hover:text-stone-700 text-sm transition-colors">Политика конфиденциальности</a>
          <a href="#" className="text-stone-500 hover:text-stone-700 text-sm transition-colors">Контакты</a>
        </div>
      </div>
    </div>
  </footer>
);

// Main Landing Page
const LandingPage = () => {
  const formRef = useRef(null);
  
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="grain-overlay min-h-screen bg-[#FDFCF8]" data-testid="landing-page">
      <Toaster position="top-center" richColors />
      <main>
        <HeroSection scrollToForm={scrollToForm} />
        <ProblemsSection />
        <BenefitsSection />
        <TestimonialsSection />
        <CreatorSection />
        <LeadFormSection formRef={formRef} />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
