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

document.getElementById('mockForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById('formStatus');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();

  status.textContent = '✅ Saved locally. Opening the next step...' ;
  status.classList.add('success');
  openThankYou(name, email);
  form.reset();
});

const testimonials = [
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Anna K.', role: 'Copywriter • +$900/mo', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Michael D.', role: 'Designer • +$990/mo', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Elena V.', role: 'VA • +$1080/mo', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Dmitry S.', role: 'SMM • +$1170/mo', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Olga M.', role: 'Content Manager • +$1260/mo', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Artem N.', role: 'Video Editor • +$1350/mo', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Sofia L.', role: 'UX Designer • +$1440/mo', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Maksim P.', role: 'No-code Dev • +$1530/mo', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Nastya R.', role: 'Assistant • +$1620/mo', image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Kirill T.', role: 'Motion Designer • +$1710/mo', image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Alina B.', role: 'Content Creator • +$1800/mo', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Roman V.', role: 'Webflow Dev • +$1890/mo', image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Katya I.', role: 'Email Marketer • +$1980/mo', image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Ihor N.', role: 'SEO Specialist • +$2070/mo', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Marina F.', role: 'Copywriter • +$2160/mo', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Andriy H.', role: 'Brand Designer • +$2250/mo', image: 'https://images.unsplash.com/photo-1507120410856-1f35574c3b45?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Lena T.', role: 'Translator • +$2340/mo', image: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Bogdan R.', role: 'Ads Specialist • +$2430/mo', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Yulia M.', role: 'Researcher • +$2520/mo', image: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Denis V.', role: 'Frontend Dev • +$2610/mo', image: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Polina A.', role: 'Editor • +$2700/mo', image: 'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Oleh C.', role: 'PPC Specialist • +$2790/mo', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Vika S.', role: 'Manager • +$2880/mo', image: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=240&h=240&fit=crop&crop=face' },
  { text: 'Clear roadmap helped me get first paid client fast and keep stable flow.', name: 'Taras P.', role: 'Social Media • +$2970/mo', image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=240&h=240&fit=crop&crop=face' }
];

const carousel = document.getElementById('testimonialCarousel');
const dotsWrap = document.getElementById('testimonialDots');
const cardsPerView = 3;
const totalPages = Math.floor(testimonials.length / cardsPerView);
let currentPage = Math.floor(Math.random() * totalPages);
let timer;

function renderTestimonials() {
  if (!carousel) return;
  const startIndex = currentPage * cardsPerView;
  const visible = testimonials.slice(startIndex, startIndex + cardsPerView);
  carousel.innerHTML = visible
    .map(
      (item) => `<article class="card"><p>"${item.text}"</p><div class="person"><img src="${item.image}" alt="${item.name}" /><div><strong>${item.name}</strong><small>${item.role}</small></div></div></article>`
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
