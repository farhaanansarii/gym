/* =========================================================
   THE IRON PARADISE GYM — script.js
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- NAVBAR SCROLL STATE ---------------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- DYNAMIC NAVBAR HEIGHT (overlap fix) ----------------
     The CSS fallback (--navbar-height: 84px) covers first paint, but the
     real navbar height can shift slightly with font loading / viewport
     width. Measuring it here keeps `scroll-margin-top` / `scroll-padding-top`
     accurate so section headings never end up hidden behind the fixed bar. */
  function syncNavbarHeight() {
    const height = navbar.getBoundingClientRect().height;
    if (height > 0) {
      document.documentElement.style.setProperty('--navbar-height', `${Math.round(height)}px`);
    }
  }
  syncNavbarHeight();
  window.addEventListener('resize', syncNavbarHeight);
  window.addEventListener('load', syncNavbarHeight);
  // Re-measure once web fonts finish loading, since font swap can change height.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncNavbarHeight);
  }

  /* ---------------- ACTIVE NAV LINK (scroll-spy) ----------------
     Highlights the nav link matching whichever section is currently
     under the "reading line" just below the navbar, and keeps the
     underline anchored to that single link only. */
  const navLinks = Array.from(document.querySelectorAll('.nav-menu .nav-link'));
  const spySections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function setActiveLink(id) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  }

  if (spySections.length) {
    const navHeightPx = navbar.getBoundingClientRect().height || 84;
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    }, {
      // Treat the strip just below the navbar as the trigger line.
      rootMargin: `-${Math.round(navHeightPx)}px 0px -70% 0px`,
      threshold: 0
    });
    spySections.forEach(sec => spyObserver.observe(sec));
  }

  /* ---------------- MOBILE MENU ---------------- */
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuBtn.classList.toggle('open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  /* ---------------- HERO ENTRANCE TIMELINE ---------------- */
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .to('.hero-label', { opacity: 1, y: 0, duration: 0.7 }, 0.3)
    .to('.hero-line', { opacity: 1, y: 0, duration: 0.9, stagger: 0.14 }, 0.5)
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.7 }, 1.05)
    .to('.hero-buttons > *', { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, 1.25)
    .to('.scroll-cue', { opacity: 1, duration: 0.6 }, 1.6);

  /* ---------------- EMBER PARTICLE CANVAS ---------------- */
  const canvas = document.getElementById('emberCanvas');
  const ctx = canvas.getContext('2d');
  const heroSection = document.querySelector('.hero');
  let particles = [];
  let animId;

  function resizeCanvas() {
    canvas.width = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      r: 0.6 + Math.random() * 2.2,
      speed: 0.4 + Math.random() * 1.1,
      drift: (Math.random() - 0.5) * 0.6,
      alpha: 0.15 + Math.random() * 0.55,
      flicker: Math.random() * Math.PI * 2,
    };
  }

  function initParticles() {
    resizeCanvas();
    const count = window.innerWidth < 640 ? 26 : 55;
    particles = Array.from({ length: count }, makeParticle);
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      p.flicker += 0.05;
      if (p.y < -10) Object.assign(p, makeParticle(), { y: canvas.height + 10 });

      const flick = 0.6 + Math.sin(p.flicker) * 0.4;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grad.addColorStop(0, `rgba(255,138,61,${p.alpha * flick})`);
      grad.addColorStop(1, 'rgba(255,75,31,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255,180,120,${p.alpha * flick})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    animId = requestAnimationFrame(drawParticles);
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initParticles();
    drawParticles();
    window.addEventListener('resize', () => { cancelAnimationFrame(animId); initParticles(); drawParticles(); });
  }

  /* ---------------- SCROLL-TRIGGERED REVEALS ---------------- */
  gsap.utils.toArray('.reveal-img').forEach(el => {
    gsap.from(el, {
      opacity: 0, x: -40, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%' }
    });
  });
  gsap.utils.toArray('.reveal-text').forEach(el => {
    gsap.from(el, {
      opacity: 0, x: 40, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%' }
    });
  });

  gsap.utils.toArray('.program-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0, y: 50, duration: 0.7, ease: 'power3.out',
      delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: card, start: 'top 88%' }
    });
  });

  gsap.utils.toArray('.price-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0, y: 60, duration: 0.8, ease: 'power3.out', delay: i * 0.1,
      scrollTrigger: { trigger: card, start: 'top 85%' }
    });
  });

  gsap.utils.toArray('.trainer-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0, y: 40, duration: 0.7, ease: 'power3.out', delay: (i % 4) * 0.08,
      scrollTrigger: { trigger: card, start: 'top 88%' }
    });
  });

  gsap.utils.toArray('.feature-block').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0, y: 30, duration: 0.6, ease: 'power2.out', delay: (i % 4) * 0.08,
      scrollTrigger: { trigger: card, start: 'top 90%' }
    });
  });

  gsap.utils.toArray('.transform-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0, y: 50, duration: 0.7, ease: 'power3.out', delay: (i % 3) * 0.1,
      scrollTrigger: { trigger: card, start: 'top 88%' }
    });
  });

  gsap.utils.toArray('section h2.section-heading').forEach(h => {
    gsap.from(h, {
      opacity: 0, y: 30, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: h, start: 'top 88%' }
    });
  });

  /* ---------------- STAT COUNTERS ---------------- */
  document.querySelectorAll('.counter').forEach(counter => {
    const target = parseFloat(counter.dataset.target);
    const suffix = counter.dataset.suffix || '';
    const decimals = parseInt(counter.dataset.decimals, 10) || 0;
    ScrollTrigger.create({
      trigger: counter,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 1.8, ease: 'power2.out',
          onUpdate: () => {
            const val = decimals > 0 ? obj.val.toFixed(decimals) : Math.floor(obj.val).toLocaleString();
            counter.textContent = val + suffix;
          },
          onComplete: () => {
            const val = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString();
            counter.textContent = val + suffix;
          }
        });
      }
    });
  });

  /* ---------------- BMI CALCULATOR ---------------- */
  const bmiForm = document.getElementById('bmiForm');
  const bmiResult = document.getElementById('bmiResult');
  const bmiValue = document.getElementById('bmiValue');
  const bmiCategory = document.getElementById('bmiCategory');
  const bmiError = document.getElementById('bmiError');

  bmiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const heightCm = parseFloat(document.getElementById('height').value);
    const weightKg = parseFloat(document.getElementById('weight').value);

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      bmiError.classList.remove('hidden');
      bmiResult.classList.add('hidden');
      return;
    }
    bmiError.classList.add('hidden');

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    let category = '';
    let color = '#FF4B1F';

    if (bmi < 18.5) { category = 'Underweight'; }
    else if (bmi < 25) { category = 'Normal'; }
    else if (bmi < 30) { category = 'Overweight'; }
    else { category = 'Obese'; }

    bmiValue.textContent = bmi.toFixed(1);
    bmiCategory.textContent = category;
    bmiCategory.style.color = color;
    bmiResult.classList.remove('hidden');
    gsap.fromTo(bmiResult, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  });

  /* ---------------- CLASS SCHEDULE TABS ---------------- */
  const schedule = {
    mon: [
      { time: '06:00 AM', name: 'Strength Training' },
      { time: '08:00 AM', name: 'Functional Fitness' },
      { time: '05:00 PM', name: 'HIIT' },
      { time: '06:30 PM', name: 'Muscle Building' },
      { time: '08:00 PM', name: 'Cross Training' },
    ],
    tue: [
      { time: '06:00 AM', name: 'Functional Fitness' },
      { time: '08:00 AM', name: 'Fat Loss Circuit' },
      { time: '05:00 PM', name: 'Strength Training' },
      { time: '06:30 PM', name: 'HIIT' },
      { time: '08:00 PM', name: 'Muscle Building' },
    ],
    wed: [
      { time: '06:00 AM', name: 'Strength Training' },
      { time: '08:00 AM', name: 'Group Training' },
      { time: '05:00 PM', name: 'Functional Fitness' },
      { time: '06:30 PM', name: 'Cross Training' },
      { time: '08:00 PM', name: 'HIIT' },
    ],
    thu: [
      { time: '06:00 AM', name: 'Muscle Building' },
      { time: '08:00 AM', name: 'Functional Fitness' },
      { time: '05:00 PM', name: 'HIIT' },
      { time: '06:30 PM', name: 'Strength Training' },
      { time: '08:00 PM', name: 'Fat Loss Circuit' },
    ],
    fri: [
      { time: '06:00 AM', name: 'Strength Training' },
      { time: '08:00 AM', name: 'Functional Fitness' },
      { time: '05:00 PM', name: 'HIIT' },
      { time: '06:30 PM', name: 'Muscle Building' },
      { time: '08:00 PM', name: 'Cross Training' },
    ],
    sat: [
      { time: '07:00 AM', name: 'Group Training' },
      { time: '09:00 AM', name: 'Functional Fitness' },
      { time: '11:00 AM', name: 'Fat Loss Circuit' },
    ],
  };

  const dayTabs = document.querySelectorAll('.day-tab');
  const scheduleList = document.getElementById('scheduleList');

  function renderSchedule(day) {
    const classes = schedule[day] || [];
    scheduleList.innerHTML = classes.map(c => `
      <div class="schedule-row">
        <span class="schedule-time">${c.time}</span>
        <span class="schedule-name">${c.name}</span>
      </div>
    `).join('');
    gsap.fromTo('.schedule-row', { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' });
  }

  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dayTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      renderSchedule(tab.dataset.day);
    });
  });
  renderSchedule('mon');

  /* ---------------- TESTIMONIALS CAROUSEL ---------------- */
  const testimonials = [
    { text: "Joining this gym completely changed my approach to fitness. The trainers actually care about your progress.", name: 'Rohan Singh' },
    { text: "The strength program pushed me past plateaus I'd been stuck at for years. Best coaching I've had.", name: 'Priya Nair' },
    { text: "Clean equipment, real trainers, zero attitude. This is what a serious gym should feel like.", name: 'Aditya Kapoor' },
    { text: "I lost 12kg in four months without crash dieting. The nutrition guidance made all the difference.", name: 'Simran Kaur' },
    { text: "The community here keeps me accountable. I actually look forward to my 6am sessions now.", name: 'Vikram Rathore' },
    { text: "Personal training here is worth every rupee. My form has never been better.", name: 'Neha Gupta' },
    { text: "From barely running a kilometre to finishing my first 10K — the functional fitness program did that.", name: 'Karan Malhotra' },
    { text: "The group classes have insane energy. It doesn't feel like a workout, it feels like a team.", name: 'Ananya Joshi' },
    { text: "Professional, clean, and the trainers genuinely track your progress every single week.", name: 'Farhan Iqbal' },
    { text: "Best decision I made this year. Stronger, leaner, and way more disciplined in every part of life.", name: 'Ritu Sharma' },
    { text: "The elite membership is worth it just for the priority coaching slots alone.", name: 'Devansh Oberoi' },
    { text: "This gym doesn't sell hype. They just help you put in the work and show up for you.", name: 'Meera Iyer' },
  ];

  const track = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  const viewport = document.getElementById('testiViewport');

  // Render base cards + clones for seamless loop
  function cardHTML(t) {
    return `
      <div class="testi-card">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-quote">"${t.text}"</p>
        <p class="testi-name">${t.name}</p>
        <p class="testi-tag">Sample review · for illustration only</p>
      </div>`;
  }

  const cloneCount = 3;
  const loopSet = [...testimonials.slice(-cloneCount), ...testimonials, ...testimonials.slice(0, cloneCount)];
  track.innerHTML = loopSet.map(cardHTML).join('');

  testimonials.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goToIndex(i));
    dotsWrap.appendChild(dot);
  });
  const dots = () => document.querySelectorAll('.testi-dot');

  let currentIndex = cloneCount; // index within loopSet
  let cardWidth = 0, gap = 24;
  let autoplayTimer;

  function getCardWidth() {
    const first = track.querySelector('.testi-card');
    if (!first) return 340;
    const style = getComputedStyle(track);
    gap = parseFloat(style.gap) || 24;
    return first.getBoundingClientRect().width + gap;
  }

  function setPosition(instant = false) {
    cardWidth = getCardWidth();
    const viewportW = viewport.getBoundingClientRect().width;
    const offset = (currentIndex * cardWidth) - (viewportW / 2) + (cardWidth / 2) - (gap / 2);
    track.style.transition = instant ? 'none' : 'transform .6s cubic-bezier(.65,0,.35,1)';
    track.style.transform = `translateX(${-offset}px)`;
  }

  function updateDots() {
    const realIndex = ((currentIndex - cloneCount) % testimonials.length + testimonials.length) % testimonials.length;
    dots().forEach((d, i) => d.classList.toggle('active', i === realIndex));
  }

  function goToIndex(realIdx) {
    currentIndex = cloneCount + realIdx;
    setPosition();
    updateDots();
    restartAutoplay();
  }

  function next() {
    currentIndex++;
    setPosition();
    updateDots();
    if (currentIndex >= testimonials.length + cloneCount) {
      setTimeout(() => { currentIndex = cloneCount; setPosition(true); }, 620);
    }
  }

  function prev() {
    currentIndex--;
    setPosition();
    updateDots();
    if (currentIndex < cloneCount) {
      setTimeout(() => { currentIndex = testimonials.length + cloneCount - 1; setPosition(true); }, 620);
    }
  }

  function restartAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, 3500);
  }

  nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });
  viewport.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  viewport.addEventListener('mouseleave', restartAutoplay);

  // touch swipe
  let touchStartX = 0;
  viewport.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; clearInterval(autoplayTimer); }, { passive: true });
  viewport.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx > 40) prev();
    else if (dx < -40) next();
    restartAutoplay();
  }, { passive: true });

  window.addEventListener('resize', () => setPosition(true));
  setTimeout(() => { setPosition(true); updateDots(); restartAutoplay(); }, 100);

  /* ---------------- FREE TRIAL FORM VALIDATION ---------------- */
  const trialForm = document.getElementById('trialForm');
  const trialSuccess = document.getElementById('trialSuccess');

  function setError(inputGroup, hasError) {
    inputGroup.classList.toggle('error', hasError);
  }

  trialForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const nameInput = document.getElementById('tf-name');
    const phoneInput = document.getElementById('tf-phone');
    const emailInput = document.getElementById('tf-email');
    const goalInput = document.getElementById('tf-goal');
    const timeInput = document.getElementById('tf-time');

    const nameGroup = nameInput.closest('.input-group');
    const phoneGroup = phoneInput.closest('.input-group');
    const emailGroup = emailInput.closest('.input-group');
    const goalGroup = goalInput.closest('.input-group');
    const timeGroup = timeInput.closest('.input-group');

    const nameOk = nameInput.value.trim().length > 1;
    setError(nameGroup, !nameOk); if (!nameOk) valid = false;

    const phoneOk = /^[6-9]\d{9}$/.test(phoneInput.value.trim().replace(/\s+/g, ''));
    setError(phoneGroup, !phoneOk); if (!phoneOk) valid = false;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    setError(emailGroup, !emailOk); if (!emailOk) valid = false;

    const goalOk = goalInput.value !== '';
    setError(goalGroup, !goalOk); if (!goalOk) valid = false;

    const timeOk = timeInput.value.trim().length > 1;
    setError(timeGroup, !timeOk); if (!timeOk) valid = false;

    if (!valid) return;

    trialSuccess.classList.add('show');
    trialForm.querySelectorAll('input, select').forEach(el => el.value = '');
    trialSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------------- PARALLAX ON CTA BG (subtle) ---------------- */
  gsap.to('.cta-bg', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.cta-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
});