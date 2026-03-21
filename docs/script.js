const GOOGLE_SCRIPT_URL = window.GOOGLE_SCRIPT_URL || '';
const PAYPAL_CLIENT_ID = window.PAYPAL_CLIENT_ID || '';
const PAYPAL_API_BASE = window.PAYPAL_API_BASE || '';

const PAYPAL_PRODUCTS = {
  basic: {
    amount: '20.00',
    buttonSelector: '.thank-cta',
    wrapId: 'paypalBasicWrap',
    containerId: 'paypalBasicButtons',
    statusId: 'paypalBasicStatus',
    successMessage: '✅ Payment received. Your FULL SYSTEM access is confirmed.'
  },
  pro: {
    amount: '200.00',
    buttonSelector: '.offer-btn',
    wrapId: 'paypalProWrap',
    containerId: 'paypalProButtons',
    statusId: 'paypalProStatus',
    successMessage: '✅ Payment received. Your PRO access is confirmed.'
  }
};

let paypalSdkPromise = null;
const paypalButtonsReady = new Set();

const LANGUAGE_MAP = {
  pl: 'PL',
  ru: 'RU',
  uk: 'UA',
  ua: 'UA',
  de: 'DE',
  en: 'EN'
};

let countryCodeCache = '';
let ipAddressCache = '';

function detectLanguageCode() {
  const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
  const navLang = (navigator.language || '').toLowerCase();
  const raw = (htmlLang || navLang || 'en').split('-')[0];
  return LANGUAGE_MAP[raw] || 'EN';
}

function detectTrafficSource() {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get('utm_source');
  if (utm) return utm;
  if (document.referrer) {
    try {
      return new URL(document.referrer).hostname || 'referral';
    } catch (_) {
      return 'referral';
    }
  }
  return 'direct';
}

async function detectCountryByIp() {
  if (countryCodeCache) return countryCodeCache;
  try {
    const response = await fetch('https://ipapi.co/json/', { method: 'GET' });
    if (!response.ok) throw new Error('ipapi failed');
    const data = await response.json();
    const code = String(data?.country_code || '').toUpperCase();
    countryCodeCache = code || 'UN';
    return countryCodeCache;
  } catch (_) {
    countryCodeCache = 'UN';
    return countryCodeCache;
  }
}

async function detectIpAddress() {
  if (ipAddressCache) return ipAddressCache;
  try {
    const response = await fetch('https://api.ipify.org?format=json', { method: 'GET' });
    if (!response.ok) throw new Error('ipify failed');
    const data = await response.json();
    ipAddressCache = String(data?.ip || '').trim() || 'unknown';
    return ipAddressCache;
  } catch (_) {
    ipAddressCache = 'unknown';
    return ipAddressCache;
  }
}

async function sendLeadToGoogleDrive(payload) {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('Google Script URL is missing');
  }

  console.log('[lead] request body:', JSON.stringify(payload, null, 2));

  // Apps Script Web Apps often fail CORS preflight for application/json.
  // Send JSON body with a "simple" content-type to avoid OPTIONS preflight.
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });

  const responseText = await response.text();
  console.log('[lead] apps script raw response:', responseText);

  let result = null;
  try {
    result = responseText ? JSON.parse(responseText) : null;
  } catch (_) {
    result = null;
  }

  const okByBody = result && (result.success === true || result.status === 'ok' || result.ok === true);
  if (!response.ok || !okByBody) {
    throw new Error(result?.error || result?.message || `Google script failed: ${response.status}; response: ${responseText}`);
  }

  return { result, responseText };
}

document.getElementById('scrollToForm')?.addEventListener('click', () => {
  document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const thankYouScreen = document.getElementById('thankYouScreen');
const thankYouName = document.getElementById('thankYouName');
const thankYouEmail = document.getElementById('thankYouEmail');

function openThankYou(name, email) {
  if (thankYouName) thankYouName.textContent = name || 'friend';
  if (thankYouEmail) thankYouEmail.textContent = `Check your inbox (${email || 'your email'})`;
  document.body.classList.add('show-thankyou');
  thankYouScreen?.scrollTo?.(0, 0);
}

function closeThankYou() {
  document.body.classList.remove('show-thankyou');
}

document.getElementById('backToLanding')?.addEventListener('click', closeThankYou);

function getPaypalEndpoint(path) {
  const endpoint = `${PAYPAL_API_BASE}${path}`;
  console.log('[paypal] resolved endpoint:', endpoint);
  return endpoint;
}

function getPaymentUi(productType) {
  const config = PAYPAL_PRODUCTS[productType];
  if (!config) throw new Error('Unknown product type');
  return {
    config,
    button: document.querySelector(config.buttonSelector),
    wrap: document.getElementById(config.wrapId),
    container: document.getElementById(config.containerId),
    status: document.getElementById(config.statusId)
  };
}

function setPaymentStatus(statusEl, message, type = '') {
  if (!statusEl) return;
  statusEl.textContent = message || '';
  statusEl.classList.remove('success', 'error');
  if (type) statusEl.classList.add(type);
}

function loadPayPalSdk() {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (paypalSdkPromise) return paypalSdkPromise;
  if (!PAYPAL_CLIENT_ID) return Promise.reject(new Error('Missing PAYPAL_CLIENT_ID'));

  paypalSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.onload = () => window.paypal ? resolve(window.paypal) : reject(new Error('PayPal SDK did not initialize'));
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.head.appendChild(script);
  });

  return paypalSdkPromise;
}

async function createPayPalOrder(productType) {
  const response = await fetch(getPaypalEndpoint('/api/paypal/create-order'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productType })
  });

  const rawText = await response.text();
  let result = {};
  try {
    result = rawText ? JSON.parse(rawText) : {};
  } catch (_) {
    result = {};
  }

  console.log('[paypal] create-order backend status:', response.status);
  console.log('[paypal] create-order backend raw body:', rawText);

  if (!response.ok || !result?.id) {
    const detail = result?.detail;
    const paypalBody = typeof detail === 'object' ? detail?.paypal_body : '';
    const paypalStatus = typeof detail === 'object' ? detail?.paypal_status : '';
    const detailMessage = typeof detail === 'object'
      ? `${detail?.message || 'PayPal create order failed'}${paypalStatus ? ` | PayPal status: ${paypalStatus}` : ''}${paypalBody ? ` | PayPal body: ${paypalBody}` : ''}`
      : (detail || result?.message || rawText || 'Could not create PayPal order');

    console.error('[paypal] create-order full error:', {
      backendStatus: response.status,
      backendBody: rawText,
      paypalStatus,
      paypalBody
    });

    const methodHint = response.status === 405
      ? ' | HTTP 405 means this host is not accepting POST on /api/paypal/create-order. If the page is opened without the real backend, deploy/use the backend host and set PAYPAL_API_BASE.'
      : '';
    throw new Error(`create-order failed | backend status: ${response.status} | ${detailMessage}${methodHint}`);
  }

  return result.id;
}

async function capturePayPalOrder(orderID, productType) {
  const response = await fetch(getPaypalEndpoint('/api/paypal/capture-order'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderID, productType })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result?.status) {
    throw new Error(result?.detail || result?.message || 'Could not capture PayPal order');
  }
  return result;
}

async function ensurePayPalButtons(productType) {
  if (paypalButtonsReady.has(productType)) return;
  const { container, status, config } = getPaymentUi(productType);
  if (!container) throw new Error('Missing PayPal container');

  const paypal = await loadPayPalSdk();
  await paypal.Buttons({
    style: {
      layout: 'vertical',
      shape: 'pill',
      height: 46,
      label: 'paypal'
    },
    createOrder: () => createPayPalOrder(productType),
    onApprove: async (data) => {
      setPaymentStatus(status, 'Capturing payment...', '');
      const result = await capturePayPalOrder(data.orderID, productType);
      setPaymentStatus(status, config.successMessage, 'success');
      const triggerButton = document.querySelector(config.buttonSelector);
      if (triggerButton) {
        triggerButton.disabled = true;
        triggerButton.textContent = productType === 'basic' ? 'FULL SYSTEM unlocked ✓' : 'PRO unlocked ✓';
      }
      return result;
    },
    onError: (error) => {
      console.error('[paypal] checkout error', error);
      setPaymentStatus(status, `⚠️ ${error?.message || 'PayPal checkout failed. Please try again.'}`, 'error');
    },
    onCancel: () => {
      setPaymentStatus(status, 'Payment was canceled. You can try again anytime.', '');
    }
  }).render(container);

  paypalButtonsReady.add(productType);
}

async function startPayPalCheckout(productType) {
  const { wrap, status } = getPaymentUi(productType);
  if (!wrap) return;
  wrap.hidden = false;
  setPaymentStatus(status, 'Loading secure PayPal checkout...', '');

  try {
    await ensurePayPalButtons(productType);
    setPaymentStatus(status, 'Complete the payment in the PayPal popup.', '');
    wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    console.error('[paypal] init error', error);
    const fullMessage = error?.message || 'Unable to start PayPal checkout.';
    console.error('[paypal] visible checkout error message:', fullMessage);
    setPaymentStatus(status, `⚠️ ${fullMessage}`, 'error');
  }
}

Object.keys(PAYPAL_PRODUCTS).forEach((productType) => {
  const { button } = getPaymentUi(productType);
  button?.addEventListener('click', () => startPayPalCheckout(productType));
});

document.getElementById('mockForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById('formStatus');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const honeypot = String(data.get('website') || '').trim();
  if (honeypot) {
    status.textContent = '⚠️ Submission blocked.';
    status.classList.remove('success');
    return;
  }

  const name = String(data.get('name') || '').trim();
  const surname = String(data.get('surname') || '').trim();
  const phone = String(data.get('phone') || '').trim();
  const about = String(data.get('about') || '').trim();
  const language = detectLanguageCode();

  if (!name || !phone || !language) {
    status.textContent = '⚠️ Please fill required fields (name, phone).';
    status.classList.remove('success');
    return;
  }

  submitBtn && (submitBtn.disabled = true);
  status.textContent = 'Sending your request...';
  status.classList.remove('success');

  try {
    const country = await detectCountryByIp();
    const ip = await detectIpAddress();
    const now = new Date();

    const payload = {
      name,
      surname,
      phone,
      about,
      language,
      country,
      ip,
      user_agent: navigator.userAgent || 'unknown',
      source: detectTrafficSource(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString()
    };

    const requiredFieldsOk = Boolean(payload.name && payload.phone && payload.language);
    if (!requiredFieldsOk) {
      throw new Error('Required fields are empty before request build');
    }

    const { result, responseText } = await sendLeadToGoogleDrive(payload);

    status.textContent = `✅ Request sent successfully (${result?.tab || 'n/a'} tab).`;
    console.log('[lead] parsed response object:', result || responseText);
    status.classList.add('success');
    openThankYou(`${name} ${surname}`.trim(), String(data.get('email') || '').trim());
    form.reset();
  } catch (error) {
    status.textContent = `⚠️ Could not send lead: ${error?.message || 'unknown error'}`;
    status.classList.remove('success');
  } finally {
    submitBtn && (submitBtn.disabled = false);
  }
});

const testimonials = [
  { text: 'I landed my first paid copy task in week one and finally felt confident online.', name: 'Anna K.', role: 'Copywriter • +$900/mo', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&crop=face' },
  { text: 'I switched from offline work to remote clients and now earn consistently.', name: 'Michael D.', role: 'Designer • +$990/mo', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=face' },
  { text: 'As a mom, I needed flexibility. This helped me earn from home safely.', name: 'Elena V.', role: 'VA • +$1080/mo', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop&crop=face' },
  { text: 'I stopped watching random videos and finally started getting paid work.', name: 'Dmitry S.', role: 'SMM • +$1170/mo', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face' },
  { text: 'The templates saved me weeks. I got first clients and repeat orders.', name: 'Olga M.', role: 'Content Manager • +$1260/mo', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=face' },
  { text: 'Started with small edits, now freelance video is my main income stream.', name: 'Artem N.', role: 'Video Editor • +$1350/mo', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=face' },
  { text: 'The outreach scripts worked. My first LinkedIn client came in 5 days.', name: 'Sofia L.', role: 'UX Designer • +$1440/mo', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=240&h=240&fit=crop&crop=face' },
  { text: 'I finally understood what to do daily and started seeing real money.', name: 'Maksim P.', role: 'No-code Dev • +$1530/mo', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=face' },
  { text: 'I used the assistant scripts and now work with two long-term clients every month.', name: 'Nastya R.', role: 'Assistant • +$1620/mo', image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&h=240&fit=crop&crop=face' },
  { text: 'Before this, my portfolio was empty. Now I deliver weekly motion gigs.', name: 'Kirill T.', role: 'Motion Designer • +$1710/mo', image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=240&h=240&fit=crop&crop=face' },
  { text: 'I posted case studies from the program and clients started messaging first.', name: 'Alina B.', role: 'Content Creator • +$1800/mo', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop&crop=face' },
  { text: 'The Webflow flow was clear: niche, offer, outreach. It worked exactly as taught.', name: 'Roman V.', role: 'Webflow Dev • +$1890/mo', image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=240&h=240&fit=crop&crop=face' },
  { text: 'I sold my first email sequence package and reinvested in a new laptop.', name: 'Katya I.', role: 'Email Marketer • +$1980/mo', image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=240&h=240&fit=crop&crop=face' },
  { text: 'I finally understood SEO service packaging and closed clients on monthly retainers.', name: 'Ihor N.', role: 'SEO Specialist • +$2070/mo', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=240&h=240&fit=crop&crop=face' },
  { text: 'I went from tiny one-off tasks to stable copy projects with repeat orders.', name: 'Marina F.', role: 'Copywriter • +$2160/mo', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop&crop=face' },
  { text: 'Brand clients now come through referrals after I followed the onboarding steps.', name: 'Andriy H.', role: 'Brand Designer • +$2250/mo', image: 'https://images.unsplash.com/photo-1507120410856-1f35574c3b45?w=240&h=240&fit=crop&crop=face' },
  { text: 'I translated my first business website and got two more requests in the same week.', name: 'Lena T.', role: 'Translator • +$2340/mo', image: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=240&h=240&fit=crop&crop=face' },
  { text: 'Ad account checklists helped me launch faster and stop losing money on tests.', name: 'Bogdan R.', role: 'Ads Specialist • +$2430/mo', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=240&h=240&fit=crop&crop=face' },
  { text: 'I started as a researcher and grew into strategy calls with international teams.', name: 'Yulia M.', role: 'Researcher • +$2520/mo', image: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=240&h=240&fit=crop&crop=face' },
  { text: 'The frontend sprint gave me confidence. I now charge properly for landing pages.', name: 'Denis V.', role: 'Frontend Dev • +$2610/mo', image: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=240&h=240&fit=crop&crop=face' },
  { text: 'I built a simple editing offer and reached a full monthly pipeline.', name: 'Polina A.', role: 'Editor • +$2700/mo', image: 'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=240&h=240&fit=crop&crop=face' },
  { text: 'After fixing my proposal structure, PPC calls started converting much better.', name: 'Oleh C.', role: 'PPC Specialist • +$2790/mo', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&h=240&fit=crop&crop=face' },
  { text: 'The weekly tasks kept me consistent. I reached income goals faster than planned.', name: 'Vika S.', role: 'Manager • +$2880/mo', image: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=240&h=240&fit=crop&crop=face' },
  { text: 'I turned social media freelancing into a predictable business with long-term contracts.', name: 'Taras P.', role: 'Social Media • +$2970/mo', image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=240&h=240&fit=crop&crop=face' }
];

const testimonialFallbacks = [
  './assets/testimonial-1.svg',
  './assets/testimonial-2.svg',
  './assets/testimonial-3.svg',
  './assets/testimonial-4.svg',
  './assets/testimonial-5.svg',
  './assets/testimonial-6.svg'
];

const testimonialsWithFallback = testimonials.map((item, index) => ({
  ...item,
  fallback: testimonialFallbacks[index % testimonialFallbacks.length]
}));

const carousel = document.getElementById('testimonialCarousel');
const dotsWrap = document.getElementById('testimonialDots');
const cardsPerView = 3;
const totalPages = Math.floor(testimonialsWithFallback.length / cardsPerView);
let currentPage = Math.floor(Math.random() * totalPages);
let timer;

function renderTestimonials() {
  if (!carousel) return;
  const startIndex = currentPage * cardsPerView;
  const visible = testimonialsWithFallback.slice(startIndex, startIndex + cardsPerView);
  carousel.innerHTML = visible
    .map(
      (item) => `<article class="card"><p>"${item.text}"</p><div class="person"><img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='${item.fallback}';" /><div><strong>${item.name}</strong><small>${item.role}</small></div></div></article>`
    )
    .join('');

  if (dotsWrap) {
    dotsWrap.innerHTML = Array.from({ length: totalPages })
      .map(
        (_, index) => `<button type="button" class="${index === currentPage ? 'active' : ''}" data-index="${index}" aria-label="Go to testimonial page ${index + 1}"></button>`
      )
      .join('');
  }
}

function animateTo(nextPage) {
  if (!carousel) return;
  carousel.classList.remove('fade-in');
  carousel.classList.add('fade-out');
  setTimeout(() => {
    currentPage = nextPage;
    renderTestimonials();
    carousel.classList.remove('fade-out');
    carousel.classList.add('fade-in');
  }, 180);
}

function nextSlide() {
  animateTo((currentPage + 1) % totalPages);
}

function startRotation() {
  clearInterval(timer);
  timer = setInterval(nextSlide, 2800);
}

function stopRotation() {
  clearInterval(timer);
}

renderTestimonials();
startRotation();

dotsWrap?.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-index]');
  if (!btn) return;
  animateTo(Number(btn.dataset.index));
  stopRotation();
  startRotation();
});

carousel?.addEventListener('mouseenter', stopRotation);
carousel?.addEventListener('mouseleave', startRotation);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopRotation();
  } else {
    startRotation();
  }
});
