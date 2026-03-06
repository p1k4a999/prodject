document.getElementById('scrollToForm')?.addEventListener('click', () => {
  document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('mockForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById('formStatus');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  status.textContent = '✅ Success! Your request is saved locally (mock submit, no network call).';
  status.classList.add('success');
  form.reset();
});

const testimonials = [
  { text: 'I got my first order in 3 weeks. The plan made it clear what to do first.', name: 'Anna K.', role: 'Copywriter • +$1,200/mo', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&crop=face' },
  { text: 'I switched from factory work to remote projects. The structure changed everything.', name: 'Michael D.', role: 'Designer • +$2,400/mo', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=face' },
  { text: 'As a mom, I needed flexibility. Now I work 4 hours/day with stable income.', name: 'Elena V.', role: 'VA • +$950/mo', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&h=240&fit=crop&crop=face' },
  { text: 'I thought freelancing was complicated, but this gave me a step-by-step map.', name: 'Dmitry S.', role: 'SMM • +$1,500/mo', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face' },
  { text: 'I left my office work and now I choose projects and clients by myself.', name: 'Olga M.', role: 'Content Manager • +$1,800/mo', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=face' },
  { text: 'Started as a hobby, now editing videos is my main monthly income.', name: 'Artem N.', role: 'Video Editor • +$2,800/mo', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=face' },
  { text: 'Got first client from LinkedIn thanks to the scripts and portfolio tips.', name: 'Sofia L.', role: 'UX Designer • +$1,650/mo', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=240&h=240&fit=crop&crop=face' },
  { text: 'I finally understood where to start and stopped wasting months on theory.', name: 'Maksim P.', role: 'No-code Dev • +$2,050/mo', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=face' }
];

const carousel = document.getElementById('testimonialCarousel');
const dotsWrap = document.getElementById('testimonialDots');
let startIndex = 0;
let timer;

function renderTestimonials() {
  if (!carousel) return;
  const visible = [0, 1, 2].map((offset) => testimonials[(startIndex + offset) % testimonials.length]);
  carousel.innerHTML = visible
    .map(
      (item) => `<article class="card"><p>"${item.text}"</p><div class="person"><img src="${item.image}" alt="${item.name}" /><div><strong>${item.name}</strong><small>${item.role}</small></div></div></article>`
    )
    .join('');

  if (dotsWrap) {
    dotsWrap.innerHTML = testimonials
      .map(
        (_, index) => `<button type="button" class="${index === startIndex ? 'active' : ''}" data-index="${index}" aria-label="Go to testimonial ${index + 1}"></button>`
      )
      .join('');
  }
}

function animateTo(nextIndex) {
  if (!carousel) return;
  carousel.classList.remove('fade-in');
  carousel.classList.add('fade-out');
  setTimeout(() => {
    startIndex = nextIndex;
    renderTestimonials();
    carousel.classList.remove('fade-out');
    carousel.classList.add('fade-in');
  }, 180);
}

function nextSlide() {
  animateTo((startIndex + 1) % testimonials.length);
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
