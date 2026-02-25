// ========================================
// Language & Translations System
// ========================================

// Embedded translations (no CORS issues)
const translationsData = {
  en: {
    "nav_home": "Home",
    "nav_about": "About",
    "hero_title": "Hello, Nice To Meet You!",
    "hero_subtitle": "Welcome to my digital space.",
    "hero_cta_learn": "Learn More",
    "hero_cta_github": "GitHub",
    "hero_quote_loading": "Loading quote...",
    "hero_quote_error": "Failed to load quote. Please refresh the page."
  },
  zh: {
    "nav_home": "首页",
    "nav_about": "关于",
    "hero_title": "你好，很高兴认识你！",
    "hero_subtitle": "欢迎来到我的数字空间。",
    "hero_cta_learn": "了解更多",
    "hero_cta_github": "GitHub",
    "hero_quote_loading": "加载格言中...",
    "hero_quote_error": "格言加载失败，请刷新页面。"
  }
};

let currentLanguage = localStorage.getItem('lang') || 
  (navigator.language.startsWith('zh') ? 'zh' : 'en');
let translations = {};

// Load language
function loadLanguage(lang) {
  console.log('Loading language:', lang);
  
  translations = translationsData[lang] || translationsData.en;
  currentLanguage = lang;
  localStorage.setItem('lang', lang);
  
  console.log('Translations loaded:', translations);
  
  // Update all elements with data-i18n attribute
  updateTranslations();
  
  // Update active language button
  updateLanguageButtons();
  
  // Restart typing effect with new language
  if (typeof restartTypingEffect === 'function') {
    restartTypingEffect();
  }
  
  // Fetch new quote when language changes
  fetchRandomQuote();
}

// Update all translations in the page
function updateTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) {
      // Don't update quote element if it already has content from API
      if (key.includes('quote') && el.classList.contains('hero-quote')) {
        const cachedQuote = localStorage.getItem('cachedQuote');
        if (cachedQuote) return; // Keep the API quote
      }
      
      el.textContent = translations[key];
      
      // Add fade-in animation
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.transition = 'opacity 0.3s ease-in-out';
        el.style.opacity = '1';
      }, 10);
    }
  });
}

// Update language button states
function updateLanguageButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const lang = btn.getAttribute('data-lang');
    if (lang === currentLanguage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Get translation by key
function getTranslation(key) {
  return translations[key] || key;
}

// Fetch random quote from Hitokoto API
async function fetchRandomQuote() {
  const heroQuote = document.querySelector('.hero-quote');
  if (!heroQuote) return;
  
  // Check if we have a cached quote and if it's still valid (within 6 hours)
  const cachedQuote = localStorage.getItem('cachedQuote');
  const cacheTimestamp = localStorage.getItem('quoteTimestamp');
  const sixHours = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  
  if (cachedQuote && cacheTimestamp) {
    const timeDiff = Date.now() - parseInt(cacheTimestamp);
    if (timeDiff < sixHours) {
      // Use cached quote
      const cached = JSON.parse(cachedQuote);
      heroQuote.textContent = cached.text;
      if (cached.author) {
        heroQuote.setAttribute('data-author', cached.author);
      }
      return;
    }
  }
  
  // Fetch new quote if cache is expired or doesn't exist
  try {
    heroQuote.textContent = getTranslation('hero_quote_loading');
    
    const response = await fetch('https://v1.hitokoto.cn/');
    if (!response.ok) throw new Error('Failed to fetch quote');
    
    const data = await response.json();
    const quoteText = `"${data.hitokoto}"`;
    const author = data.from || data.from_who || '';
    
    heroQuote.textContent = quoteText;
    
    // Add author if available
    if (author) {
      heroQuote.setAttribute('data-author', `— ${author}`);
    } else {
      heroQuote.removeAttribute('data-author');
    }
    
    // Cache the quote
    localStorage.setItem('cachedQuote', JSON.stringify({
      text: quoteText,
      author: author ? `— ${author}` : ''
    }));
    localStorage.setItem('quoteTimestamp', Date.now().toString());
  } catch (error) {
    console.error('Error fetching quote:', error);
    heroQuote.textContent = getTranslation('hero_quote_error');
  }
}

// Initialize language system
function initLanguage() {
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  
  if (urlLang && (urlLang === 'en' || urlLang === 'zh')) {
    currentLanguage = urlLang;
  }
  
  loadLanguage(currentLanguage);
  
  // Setup language button listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      loadLanguage(lang);
    });
  });
}

// Export for use in other scripts
window.initLanguage = initLanguage;
window.getTranslation = getTranslation;
window.fetchRandomQuote = fetchRandomQuote;
