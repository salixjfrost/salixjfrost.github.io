// ========================================
// Performance-Optimized Smooth Scrolling
// ========================================
let scrollY = 0;
let targetY = 0;
let rafId = null;
let isScrolling = false;
const SCROLL_THRESHOLD = 0.1;
const container = document.getElementById('scrollContainer');

function optimizedSmoothScroll() {
  const diff = targetY - scrollY;
  
  if (Math.abs(diff) < SCROLL_THRESHOLD) {
    scrollY = targetY;
    isScrolling = false;
    container.style.willChange = 'auto';
    return;
  }
  
  isScrolling = true;
  container.style.willChange = 'transform';
  
  const damping = Math.abs(diff) > 100 ? 0.15 : 0.1;
  scrollY += diff * damping;
  
  container.style.transform = `translate3d(0, ${-scrollY}px, 0)`;
  rafId = requestAnimationFrame(optimizedSmoothScroll);
}

window.addEventListener('scroll', () => {
  targetY = window.scrollY;
  if (!isScrolling) {
    optimizedSmoothScroll();
  }
}, { passive: true });

optimizedSmoothScroll();

// ========================================
// Progress Bar
// ========================================
const progressBar = document.getElementById('progressBar');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const height = document.body.scrollHeight - window.innerHeight;
  const progress = Math.min(scrolled / height, 1);
  progressBar.style.transform = `scaleX(${progress})`;
  progressBar.setAttribute('aria-valuenow', Math.round(progress * 100));
}, { passive: true });

// ========================================
// Body Height Management
// ========================================
function updateBodyHeight() {
  const height = container.getBoundingClientRect().height;
  document.body.style.height = `${height}px`;
}

updateBodyHeight();
window.addEventListener('resize', updateBodyHeight);

// ========================================
// Toast Notification System
// ========================================
function showToast(message, duration = 2000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ========================================
// SPA Routing
// ========================================
function navigate(path) {
  history.pushState(null, null, path);
  router(path);
}

function router(path) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
  
  let activePage = 'home';
  document.getElementById(activePage).classList.add('active');
  
  const navMap = {
    'home': '/'
  };
  
  const activeLink = document.querySelector(`nav a[href="${navMap[activePage]}"]`);
  if (activeLink) activeLink.classList.add('active');
  
  updateMetaTags(activePage);
  
  window.scrollTo(0, 0);
  targetY = 0;
  scrollY = 0;
  
  setTimeout(updateBodyHeight, 100);
}

document.querySelectorAll('[data-link]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(link.getAttribute('href'));
  });
});

window.addEventListener('popstate', () => router(location.pathname));

// ========================================
// SEO - Dynamic Meta Tags
// ========================================
function updateMetaTags(page) {
  const metaInfo = {
    home: {
      title: 'SalixWen',
      description: 'Minimal development and security insights'
    }
  };
  
  const info = metaInfo[page] || metaInfo.home;
  document.title = info.title;
  
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = info.description;
}

// ========================================
// Network Status
// ========================================
window.addEventListener('online', () => {
  showToast('✓ Back online');
});

window.addEventListener('offline', () => {
  showToast('⚠ You are offline', 3000);
});

// ========================================
// TYPING ANIMATION EFFECT
// ========================================
function getTypingWords() {
  return [getTranslation('hero_title')];
}

let words = getTypingWords();
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 150;

const typingElement = document.getElementById('typingText');

function typeEffect() {
  const currentWord = words[wordIndex];

  if (isDeleting) {
    typingElement.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;
    typingSpeed = 120;
  } else {
    typingElement.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
    typingSpeed = 300;
  }

  if (!isDeleting && charIndex === currentWord.length) {
    typingSpeed = 3750;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    typingSpeed = 1200;
  }

  setTimeout(typeEffect, typingSpeed);
}

function restartTypingEffect() {
  words = getTypingWords();
  wordIndex = 0;
  charIndex = 0;
  isDeleting = false;
  typingElement.textContent = '';
}

// ========================================
// Initialize
// ========================================
window.addEventListener('load', () => {
  initLanguage();
  fetchRandomQuote();
  router(location.pathname);
  setTimeout(typeEffect, 500);
  
  // Performance monitoring
  if ('PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.renderTime || entry.loadTime);
        }
      }
    });
    
    try {
      perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }
  }
  
  console.log('✨ Website initialized');
});
