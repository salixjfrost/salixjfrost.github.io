// ========================================
// Language & Translations System
// ========================================
const translations = {
  en: {
    nav_home: 'Home',
    nav_about: 'About',
    language_label: 'Language',
    hero_cta_learn: 'Learn More',
    hero_title: 'Hello, Nice To Meet You!',
    hero_subtitle: 'Welcome to my digital space.'
  },
  zh_CN: {
    nav_home: '首页',
    nav_about: '关于',
    language_label: '语言',
    hero_cta_learn: '了解更多',
    hero_title: '你好，很高兴认识你！',
    hero_subtitle: '欢迎来到我的数字空间。'
  }
};

// Get current language from localStorage or browser preference
let currentLanguage = localStorage.getItem('language');
if (!currentLanguage) {
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'zh') {
    currentLanguage = 'zh_CN';
  } else {
    currentLanguage = 'en';
  }
  localStorage.setItem('language', currentLanguage);
}

// Translation getter function
function getTranslation(key) {
  return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

// Update language
function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  updateLanguageUI();
  if (typeof restartTypingEffect === 'function') {
    restartTypingEffect();
  }
}

// Update all UI text based on current language
function updateLanguageUI() {
  // Nav links
  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === '/') link.textContent = getTranslation('nav_home');
    else if (link.getAttribute('href').includes('about')) link.textContent = getTranslation('nav_about');
  });

  // Language selector
  const langSelector = document.getElementById('languageSelector');
  if (langSelector) langSelector.value = currentLanguage;

  // Hero section
  const heroSubtitle = document.querySelector('.hero p');
  if (heroSubtitle) heroSubtitle.textContent = getTranslation('hero_subtitle');

  const ctaButtons = document.querySelectorAll('.cta-button');
  if (ctaButtons.length >= 1) {
    ctaButtons[0].textContent = getTranslation('hero_cta_learn');
  }
}
