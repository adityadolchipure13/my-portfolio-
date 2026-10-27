// Updates the mascot pose by calculating and setting sprite position, size, and clipping mask.
function setPose(poseName) {
  const mascotImg = document.getElementById('mascot-img');
  if (!mascotImg) return;
  const poses = {
    point: { size: '274.2857% 214.2259%', pos: '15.3689% 0%', ratio: '560 / 478', clip: 'none' },
    action: { size: '223.2558% 214.2259%', pos: '96.9340% 0%', ratio: '688 / 478', clip: 'none' },
    think: { size: '361.4118% 187.5458%', pos: '6.3006% 100%', ratio: '425 / 546', clip: 'polygon(0% 0%, 63% 0%, 63% 3.5%, 100% 3.5%, 100% 100%, 0% 100%)' },
    laugh: { size: '342.8571% 187.5458%', pos: '51.6544% 100%', ratio: '448 / 546', clip: 'polygon(25% 0%, 75% 0%, 75% 4.5%, 100% 4.5%, 100% 100%, 0% 100%, 0% 4.5%, 25% 4.5%)' },
    draw: { size: '314.7541% 187.5458%', pos: '97.5191% 100%', ratio: '488 / 546', clip: 'polygon(41% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 3.5%, 41% 3.5%)' }
  };
  const target = poses[poseName] || poses.laugh;
  mascotImg.style.backgroundSize = target.size;
  mascotImg.style.backgroundPosition = target.pos;
  mascotImg.style.aspectRatio = target.ratio;
  mascotImg.style.clipPath = target.clip;
  mascotImg.classList.remove('mascot-pop');
  void mascotImg.offsetWidth;
  mascotImg.classList.add('mascot-pop');
}

// Types out text character by character into the mascot speech bubble with a pleasant typing cadence.
let speechTimeout = null;
function typeSpeech(text) {
  const bubble = document.getElementById('mascot-bubble');
  if (!bubble) return;
  if (speechTimeout) clearTimeout(speechTimeout);
  bubble.textContent = '';
  let index = 0;
  function addLetter() {
    if (index < text.length) {
      bubble.textContent += text.charAt(index);
      index++;
      speechTimeout = setTimeout(addLetter, 22);
    }
  }
  addLetter();
}

// Observes sections entering the middle of the viewport and updates the mascot pose and bubble.
function setupSectionObserver() {
  const sections = document.querySelectorAll('section[data-pose]');
  if (!sections.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pose = entry.target.getAttribute('data-pose');
        let say = entry.target.getAttribute('data-say');
        if (entry.target.id === 'hero-section') {
          const isReturning = localStorage.getItem('visited_before');
          if (isReturning) {
            say = "Oh hi, you're back!";
          } else {
            localStorage.setItem('visited_before', 'true');
          }
        }
        if (pose) setPose(pose);
        if (say) typeSpeech(say);
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => observer.observe(s));
}

// Initializes the mascot greeting and pose for the first section visible on page load.
function initFirstSectionMascot() {
  const firstSection = document.querySelector('section[data-pose]');
  if (!firstSection) return;
  const pose = firstSection.getAttribute('data-pose');
  let say = firstSection.getAttribute('data-say');
  if (firstSection.id === 'hero-section') {
    if (localStorage.getItem('visited_before')) {
      say = "Oh hi, you're back!";
    } else {
      localStorage.setItem('visited_before', 'true');
    }
  }
  setPose(pose);
  typeSpeech(say);
}

// Wraps each word of the hero heading in animated spans that lift up one by one.
function setupHeroWords() {
  const heroHeading = document.querySelector('.hero-title');
  if (!heroHeading) return;
  const words = heroHeading.textContent.trim().split(/\s+/);
  heroHeading.innerHTML = '';
  words.forEach((word, index) => {
    const wrap = document.createElement('span');
    wrap.className = 'hero-word-wrap';
    const span = document.createElement('span');
    span.className = 'hero-word';
    span.textContent = word;
    span.style.animationDelay = `${index * 0.12 + 0.1}s`;
    wrap.appendChild(span);
    heroHeading.appendChild(wrap);
  });
}

// Gradually turns words from translucent to solid as the user scrolls past the text container.
function setupScrollFill() {
  const container = document.getElementById('scroll-fill-p');
  if (!container) return;
  const words = container.textContent.trim().split(/\s+/);
  container.innerHTML = words.map(w => `<span class="scroll-word">${w} </span>`).join('');
  const spanList = container.querySelectorAll('.scroll-word');

  function updateWords() {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const start = windowHeight * 0.85;
    const end = windowHeight * 0.25;
    const totalDist = start - end;
    const current = start - rect.top;
    const progress = Math.min(Math.max(current / totalDist, 0), 1);
    const wordsToLight = Math.floor(progress * spanList.length);
    spanList.forEach((span, idx) => {
      span.style.opacity = idx <= wordsToLight ? '1' : '0.2';
    });
  }

  window.addEventListener('scroll', updateWords, { passive: true });
  updateWords();
}

// Fades and slides in cards and content blocks when they scroll into the browser window.
function setupRevealElements() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(el => observer.observe(el));
}

// Handles full-screen coloured curtain transitions during page loads and internal navigation.
function setupNavCurtain() {
  const curtain = document.getElementById('page-curtain');
  if (!curtain) return;

  setTimeout(() => {
    curtain.classList.add('curtain-up');
    curtain.classList.remove('curtain-down');
  }, 50);

  const links = document.querySelectorAll('a[href$=".html"]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href');
      if (target && !link.hasAttribute('target') && !target.startsWith('#')) {
        e.preventDefault();
        curtain.classList.remove('curtain-up');
        curtain.classList.add('curtain-down');
        setTimeout(() => {
          window.location.href = target;
        }, 360);
      }
    });
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      curtain.classList.add('curtain-up');
      curtain.classList.remove('curtain-down');
    }
  });
}

// Opens and closes the mobile navigation menu when the user taps the hamburger button.
function setupMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen.toString());
  });

  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Filters student project cards smoothly by category when filter buttons are clicked.
function setupWorkFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          setTimeout(() => { card.style.opacity = '1'; }, 30);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// Validates contact inputs, launches mail app on submit, and powers the email copy button.
function setupContactForm() {
  const form = document.getElementById('contact-form');
  const copyBtn = document.getElementById('copy-email-btn');
  const emailEl = document.getElementById('contact-email');

  if (copyBtn && emailEl) {
    copyBtn.addEventListener('click', () => {
      const email = emailEl.textContent.trim();
      navigator.clipboard.writeText(email).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
      });
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('sender-name').value.trim();
      const email = document.getElementById('sender-email').value.trim();
      const message = document.getElementById('sender-message').value.trim();

      if (!name || !email || !message) {
        alert('Please fill out all fields before sending!');
        return;
      }

      setPose('action');
      typeSpeech('Opening your mail app...');

      const mailtoLink = `mailto:adii@gmail.com?subject=${encodeURIComponent('Student Portfolio Note from ' + name)}&body=${encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')')}`;
      setTimeout(() => {
        window.location.href = mailtoLink;
      }, 500);
    });
  }
}

// Bootstraps all page features once the DOM has finished loading.
document.addEventListener('DOMContentLoaded', () => {
  setupNavCurtain();
  setupMobileMenu();
  setupHeroWords();
  setupScrollFill();
  setupRevealElements();
  setupSectionObserver();
  initFirstSectionMascot();
  setupWorkFilters();
  setupContactForm();
});
