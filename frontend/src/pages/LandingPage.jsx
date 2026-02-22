import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, AlertCircle, ArrowRight, Users, Target, Lightbulb, Shield, Clock, TrendingUp, Quote } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Testimonial images (shared across all languages)
const testimonialImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
];

// Hero Section
const HeroSection = ({ scrollToForm }) => {
  const { t } = useLanguage();
  
  return (
    <section data-testid="hero-section" className="min-h-[90vh] flex items-center py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <span className="inline-block text-sm uppercase tracking-widest text-stone-500 mb-4 font-medium">
              {t.heroTag}
            </span>
            <h1 data-testid="hero-title" className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-4">
              {t.heroTitle} <span className="text-[#059669]">{t.heroTitleAccent}</span>
            </h1>
            {/* Urgency/Result highlight */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 inline-block">
              <p className="text-emerald-800 font-medium text-base md:text-lg">
                {t.heroHighlight}
              </p>
            </div>
            <p className="text-lg md:text-xl text-stone-600 leading-relaxed mb-8 max-w-xl">
              {t.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                data-testid="hero-cta-button"
                onClick={scrollToForm}
                className="bg-[#064E3B] text-white hover:bg-[#064E3B]/90 rounded-full px-8 py-4 text-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                {t.heroCta}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-stone-200">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                </div>
                <span className="text-stone-600 text-sm font-medium">2,400+ {t.heroProof}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
                <span className="text-stone-600 text-sm ml-1">4.9 {t.heroRating}</span>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-100 to-amber-50 rounded-3xl -z-10" />
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                alt="Freelancer"
                className="rounded-2xl shadow-2xl shadow-stone-300/50 w-full object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border border-stone-100 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{t.heroFirstOrder}</p>
                    <p className="text-xs text-stone-500">{t.heroFirstOrderTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Problems Section
const ProblemsSection = () => {
  const { t } = useLanguage();
  
  const problems = [
    { icon: AlertCircle, title: t.problem1Title, description: t.problem1Desc },
    { icon: Shield, title: t.problem2Title, description: t.problem2Desc },
    { icon: Clock, title: t.problem3Title, description: t.problem3Desc }
  ];

  return (
    <section data-testid="problems-section" className="py-20 md:py-32 bg-stone-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-sm uppercase tracking-widest text-stone-500 mb-4 block">{t.problemsTag}</span>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-stone-900 leading-tight">
            {t.problemsTitle} <span className="text-[#D97706]">{t.problemsTitleAccent}</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div key={index} className="bg-white rounded-2xl border border-stone-200 p-8 md:p-10 hover:shadow-lg transition-shadow duration-300">
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
  const { t } = useLanguage();
  
  const benefits = [
    { icon: Target, title: t.benefit1Title, description: t.benefit1Desc },
    { icon: Users, title: t.benefit2Title, description: t.benefit2Desc },
    { icon: Lightbulb, title: t.benefit3Title, description: t.benefit3Desc },
    { icon: TrendingUp, title: t.benefit4Title, description: t.benefit4Desc }
  ];

  return (
    <section data-testid="benefits-section" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-sm uppercase tracking-widest text-stone-500 mb-4 block">{t.benefitsTag}</span>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-stone-900 leading-tight">
            {t.benefitsTitle} <span className="text-[#059669]">{t.benefitsTitleAccent}</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-8 md:p-10">
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
  const { t } = useLanguage();
  
  const testimonials = t.testimonials?.map((item, i) => ({
    ...item,
    image: testimonialImages[i % testimonialImages.length]
  })) || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Show 3 testimonials at a time
  const getVisibleTestimonials = () => {
    if (testimonials.length === 0) return [];
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return result;
  };

  return (
    <section data-testid="testimonials-section" className="py-20 md:py-32 bg-stone-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-sm uppercase tracking-widest text-stone-500 mb-4 block">{t.testimonialsTag}</span>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-stone-900 leading-tight">
            {t.testimonialsTitle} <span className="text-[#059669]">{t.testimonialsTitleAccent}</span>
          </h2>
        </div>
        
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          {getVisibleTestimonials().map((testimonial, index) => (
            <div key={`${currentIndex}-${index}`} className="bg-white rounded-2xl border border-stone-100 p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <Quote className="w-8 h-8 text-emerald-200 mb-4" />
              <p className="text-stone-700 leading-relaxed flex-grow mb-6">"{testimonial.text}"</p>
              <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                <div className="flex items-center gap-3">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-medium text-stone-900">{testimonial.name}</p>
                    <p className="text-sm text-stone-500">{testimonial.role}</p>
                  </div>
                </div>
                <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full">
                  {testimonial.result}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsAnimating(false);
                }, 300);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-emerald-600 w-6' : 'bg-stone-300 hover:bg-stone-400'}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mt-16 pt-16 border-t border-stone-200">
          <div className="text-center">
            <p className="font-heading text-4xl md:text-5xl font-bold text-stone-900">2,400+</p>
            <p className="text-stone-500 mt-2">{t.statPlan}</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-4xl md:text-5xl font-bold text-[#059669]">78%</p>
            <p className="text-stone-500 mt-2">{t.statOrders}</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-4xl md:text-5xl font-bold text-stone-900">$1,850</p>
            <p className="text-stone-500 mt-2">{t.statIncome}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Creator Section
const CreatorSection = () => {
  const { t } = useLanguage();
  
  return (
    <section data-testid="creator-section" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face"
                alt={t.creatorName}
                className="w-32 h-32 rounded-full object-cover border-4 border-emerald-100"
              />
            </div>
            <div className="text-center md:text-left">
              <span className="text-sm uppercase tracking-widest text-stone-500 mb-2 block">{t.creatorTag}</span>
              <h3 className="font-heading text-2xl font-semibold text-stone-900 mb-3">{t.creatorName}</h3>
              <p className="text-stone-600 leading-relaxed mb-4">{t.creatorBio}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-stone-500">
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" />{t.creatorExp}</span>
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" />{t.creatorStudents}</span>
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" />{t.creatorIncome}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Lead Form Section
const LeadFormSection = ({ formRef }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 2) newErrors.name = t.formErrorName;
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.formErrorEmail;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API}/leads`, formData);
      toast.success(t.formSuccess);
      localStorage.setItem('leadData', JSON.stringify(response.data));
      navigate('/thank-you');
    } catch (error) {
      toast.error(t.formError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={formRef} data-testid="lead-form-section" className="py-20 md:py-32 bg-stone-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm uppercase tracking-widest text-stone-500 mb-4 block">{t.formTag}</span>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-stone-900 leading-tight mb-4">{t.formTitle}</h2>
            <p className="text-lg text-stone-600">{t.formDescription}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 shadow-lg p-8 md:p-10" data-testid="lead-form">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">{t.formName}</label>
                <input
                  type="text" id="name" data-testid="input-name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-stone-50 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-none transition-all placeholder:text-stone-400 text-stone-900 ${errors.name ? 'border-red-400' : 'border-stone-200'}`}
                  placeholder={t.formNamePlaceholder}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">{t.formEmail}</label>
                <input
                  type="email" id="email" data-testid="input-email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-stone-50 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-none transition-all placeholder:text-stone-400 text-stone-900 ${errors.email ? 'border-red-400' : 'border-stone-200'}`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">
                  {t.formPhone} <span className="text-stone-400">{t.formPhoneOptional}</span>
                </label>
                <input
                  type="tel" id="phone" data-testid="input-phone" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-none transition-all placeholder:text-stone-400 text-stone-900"
                  placeholder="+1 (999) 123-4567"
                />
              </div>
              
              <button
                type="submit" data-testid="submit-button" disabled={loading}
                className="w-full bg-[#064E3B] text-white hover:bg-[#064E3B]/90 rounded-full px-8 py-4 text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? t.formSubmitting : <>{t.formSubmit} <ArrowRight className="w-5 h-5" /></>}
              </button>
            </div>
            <p className="text-center text-sm text-stone-500 mt-6">{t.formConsent}</p>
          </form>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="py-12 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-sm">© 2025 Freelance Start. {t.footerRights}</p>
          <div className="flex gap-6">
            <a href="#" className="text-stone-500 hover:text-stone-700 text-sm transition-colors">{t.footerPrivacy}</a>
            <a href="#" className="text-stone-500 hover:text-stone-700 text-sm transition-colors">{t.footerContacts}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page
const LandingPage = () => {
  const formRef = useRef(null);
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="grain-overlay min-h-screen bg-[#FDFCF8]" data-testid="landing-page">
      <Toaster position="top-center" richColors />
      <LanguageSwitcher />
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
