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
  { text: 'This gave me a step-by-step map and removed fear of starting.', name: 'Dmitry S.', role: 'SMM • +$1,500/mo', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face' },
  { text: 'Now I choose projects myself and earn steadily every month.', name: 'Olga M.', role: 'Content Manager • +$1,800/mo', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=face' },
  { text: 'Started as a hobby, now video editing became my core income.', name: 'Artem N.', role: 'Video Editor • +$2,800/mo', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=face' },
  { text: 'Got first client from LinkedIn thanks to scripts and templates.', name: 'Sofia L.', role: 'UX Designer • +$1,650/mo', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=240&h=240&fit=crop&crop=face' },
  { text: 'I stopped wasting months and finally got practical results.', name: 'Maksim P.', role: 'No-code Dev • +$2,050/mo', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=face' },
  { text: 'Closed my first client in five days with the provided pitch structure.', name: 'Nastya R.', role: 'Virtual Assistant • +$1,100/mo', image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&h=240&fit=crop&crop=face' },
  { text: 'Weekly orders became stable, no panic anymore.', name: 'Kirill T.', role: 'Motion Designer • +$2,300/mo', image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=240&h=240&fit=crop&crop=face' },
  { text: 'This roadmap removed all chaos. I just followed steps.', name: 'Alina B.', role: 'Content Creator • +$1,400/mo', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop&crop=face' },
  { text: 'In one month I replaced my old part-time income fully.', name: 'Roman V.', role: 'Webflow Dev • +$2,600/mo', image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=240&h=240&fit=crop&crop=face' },
  { text: 'After maternity leave this was my best way to restart career.', name: 'Katya I.', role: 'Email Marketer • +$1,350/mo', image: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=240&h=240&fit=crop&crop=face' },
  { text: 'The niche list helped me avoid dead ends and start faster.', name: 'Ihor N.', role: 'SEO Specialist • +$1,900/mo', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=240&h=240&fit=crop&crop=face' },
  { text: 'My first two clients came from one outreach script.', name: 'Marina F.', role: 'Copywriter • +$1,700/mo', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop&crop=face' },
  { text: 'I finally built confidence and portfolio in one month.', name: 'Andriy H.', role: 'Brand Designer • +$2,200/mo', image: 'https://images.unsplash.com/photo-1507120410856-1f35574c3b45?w=240&h=240&fit=crop&crop=face' }
];

const carousel = document.getElementById('testimonialCarousel');
const dotsWrap = document.getElementById('testimonialDots');
let startIndex = Math.floor(Math.random() * testimonials.length);
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
