// ========================================
// CSS BEST PRACTICES & INDUSTRY METHODOLOGIES
// Day 2 Workshop - Interactive JavaScript
// ========================================

// ========================================
// GLOBAL STATE MANAGEMENT
// ========================================
const workshopState = {
    currentTheme: 'netflix',
    bemModifiers: new Set(),
    darkMode: false,
    performanceResults: {},
    quizAnswers: {}
};

// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <div class="toast__content">
            <span class="toast__icon">${getToastIcon(type)}</span>
            <span class="toast__message">${message}</span>
        </div>
        <button class="toast__close" onclick="removeToast(this)">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('toast--show'), 100);
    
    // Auto remove
    setTimeout(() => removeToast(toast.querySelector('.toast__close')), duration);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.innerHTML = `
        <style>
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: var(--z-tooltip, 1070);
                max-width: 400px;
            }
            
            .toast {
                background: var(--color-surface, #ffffff);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: var(--radius-lg, 8px);
                padding: var(--space-4, 1rem);
                margin-bottom: var(--space-3, 0.75rem);
                box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
                transform: translateX(100%);
                transition: transform 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .toast--show {
                transform: translateX(0);
            }
            
            .toast--success { border-left: 4px solid var(--color-success, #10b981); }
            .toast--error { border-left: 4px solid var(--color-error, #ef4444); }
            .toast--warning { border-left: 4px solid var(--color-warning, #f59e0b); }
            .toast--info { border-left: 4px solid var(--color-info, #3b82f6); }
            
            .toast__content {
                display: flex;
                align-items: center;
                gap: var(--space-3, 0.75rem);
            }
            
            .toast__icon {
                font-size: var(--text-lg, 1.125rem);
            }
            
            .toast__message {
                color: var(--color-text-primary, #0f172a);
                font-weight: var(--font-medium, 500);
            }
            
            .toast__close {
                background: none;
                border: none;
                font-size: var(--text-xl, 1.25rem);
                cursor: pointer;
                color: var(--color-text-secondary, #475569);
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        </style>
    `;
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

function removeToast(closeButton) {
    const toast = closeButton.closest('.toast');
    if (toast) {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }
}

// ========================================
// BEM METHODOLOGY INTERACTIVE DEMO
// ========================================
function toggleBEMModifier(modifier) {
    const card = document.getElementById('bem-card');
    const output = document.getElementById('bem-classes-output');
    
    if (!card || !output) return;
    
    const modifierClass = `movie-card--${modifier}`;
    
    if (workshopState.bemModifiers.has(modifier)) {
        workshopState.bemModifiers.delete(modifier);
        card.classList.remove(modifierClass);
    } else {
        workshopState.bemModifiers.add(modifier);
        card.classList.add(modifierClass);
    }
    
    updateBEMClassesOutput();
    showToast(`${modifier} modifier ${workshopState.bemModifiers.has(modifier) ? 'added' : 'removed'}!`, 'info');
}

function updateBEMClassesOutput() {
    const output = document.getElementById('bem-classes-output');
    if (!output) return;
    
    const baseClasses = [
        '.movie-card',
        '.movie-card__header',
        '.movie-card__title',
        '.movie-card__year',
        '.movie-card__poster',
        '.movie-card__poster-image',
        '.movie-card__body',
        '.movie-card__rating',
        '.movie-card__rating--high',
        '.movie-card__description',
        '.movie-card__footer',
        '.movie-card__action-btn',
        '.movie-card__action-btn--primary',
        '.movie-card__action-btn--secondary'
    ];
    
    const modifierClasses = Array.from(workshopState.bemModifiers).map(m => `.movie-card--${m}`);
    
    const allClasses = [...baseClasses, ...modifierClasses];
    
    output.innerHTML = `<code>${allClasses.join('\n')}</code>`;
}

// ========================================
// THEME SWITCHING FUNCTIONALITY
// ========================================
function switchTheme(themeName) {
    workshopState.currentTheme = themeName;
    const themeCard = document.getElementById('theme-demo-card');
    
    if (!themeCard) return;
    
    // Remove all theme classes
    themeCard.className = 'theme-card';
    
    // Add new theme
    themeCard.setAttribute('data-theme', themeName);
    
    // Update primary color based on theme
    const themeColors = {
        netflix: '#e50914',
        spotify: '#1db954',
        youtube: '#ff0000',
        discord: '#5865f2'
    };
    
    document.documentElement.style.setProperty('--color-primary', themeColors[themeName]);
    
    showToast(`${themeName.charAt(0).toUpperCase() + themeName.slice(1)} theme applied!`, 'success');
}

// ========================================
// DARK MODE TOGGLE
// ========================================
function toggleDarkMode() {
    workshopState.darkMode = !workshopState.darkMode;
    const html = document.documentElement;
    const toggleButton = document.querySelector('.theme-toggle');
    
    if (workshopState.darkMode) {
        html.setAttribute('data-theme', 'dark');
        if (toggleButton) {
            toggleButton.querySelector('.theme-toggle__icon').textContent = '☀️';
            toggleButton.querySelector('.theme-toggle__text').textContent = 'Toggle Light Mode';
        }
        showToast('Dark mode activated! 🌙', 'info');
    } else {
        html.removeAttribute('data-theme');
        if (toggleButton) {
            toggleButton.querySelector('.theme-toggle__icon').textContent = '🌙';
            toggleButton.querySelector('.theme-toggle__text').textContent = 'Toggle Dark Mode';
        }
        showToast('Light mode activated! ☀️', 'info');
    }
}

// ========================================
// RANDOM THEME GENERATOR
// ========================================
function randomizeTheme() {
    const colors = [
        '#e50914', '#1db954', '#ff0000', '#5865f2',
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
        '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.documentElement.style.setProperty('--color-primary', randomColor);
    
    showToast(`Random theme applied! Color: ${randomColor}`, 'success');
}

// ========================================
// NAMING QUIZ FUNCTIONALITY
// ========================================
function checkAnswer(button, isCorrect) {
    const quizFeedback = document.getElementById('quiz-feedback');
    const allOptions = button.parentElement.querySelectorAll('.quiz-option');
    
    // Disable all options
    allOptions.forEach(option => {
        option.disabled = true;
        option.style.opacity = '0.6';
    });
    
    if (isCorrect) {
        button.style.backgroundColor = 'var(--color-success)';
        button.style.color = 'white';
        quizFeedback.innerHTML = `
            <div style="color: var(--color-success); margin-top: var(--space-4);">
                ✅ ถูกต้อง! ".primary-button" ใช้ชื่อที่สื่อความหมายและไม่ผูกติดกับรูปลักษณ์
            </div>
        `;
        showToast('🎉 คำตอบถูกต้อง!', 'success');
    } else {
        button.style.backgroundColor = 'var(--color-error)';
        button.style.color = 'white';
        quizFeedback.innerHTML = `
            <div style="color: var(--color-error); margin-top: var(--space-4);">
                ❌ ผิด! ควรใช้ชื่อที่สื่อความหมายแทนการอ้างอิงสีหรือตำแหน่ง
            </div>
        `;
        showToast('❌ ลองใหม่นะ!', 'error');
    }
}

// ========================================
// PERFORMANCE TESTING FUNCTIONALITY
// ========================================
function runPerformanceTest(testType) {
    const playground = document.getElementById('animation-playground');
    const fpsDisplay = document.getElementById('fps-value');
    const paintTimeDisplay = document.getElementById('paint-time');
    
    if (!playground) return;
    
    // Clear previous test
    playground.innerHTML = '';
    
    const startTime = performance.now();
    let frameCount = 0;
    let animationId;
    
    // Create test elements
    const elementCount = testType === 'heavy' ? 100 : 50;
    const elements = [];
    
    for (let i = 0; i < elementCount; i++) {
        const element = document.createElement('div');
        element.className = `perf-test-element perf-test-element--${testType}`;
        element.style.cssText = `
            width: 20px;
            height: 20px;
            background: var(--color-primary);
            position: absolute;
            left: ${Math.random() * 300}px;
            top: ${Math.random() * 200}px;
            border-radius: 50%;
        `;
        
        if (testType === 'heavy') {
            // Bad practice: animating layout properties
            element.style.transition = 'left 2s ease-in-out';
            element.style.left = Math.random() * 300 + 'px';
        } else {
            // Good practice: animating transform
            element.style.transition = 'transform 2s ease-in-out';
            element.style.transform = `translateX(${Math.random() * 300}px)`;
        }
        
        playground.appendChild(element);
        elements.push(element);
    }
    
    // Start FPS monitoring
    function measureFPS() {
        frameCount++;
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / elapsedTime);
            const paintTime = Math.round(currentTime - startTime);
            
            if (fpsDisplay) fpsDisplay.textContent = `${fps} FPS`;
            if (paintTimeDisplay) paintTimeDisplay.textContent = `${paintTime}ms`;
            
            workshopState.performanceResults[testType] = { fps, paintTime };
            
            const message = fps > 30 ? 
                `Great performance! ${fps} FPS` : 
                `Performance issue detected: ${fps} FPS`;
            
            showToast(message, fps > 30 ? 'success' : 'warning');
            return;
        }
        
        animationId = requestAnimationFrame(measureFPS);
    }
    
    requestAnimationFrame(measureFPS);
    
    showToast(`Running ${testType} animation test...`, 'info');
}

function clearPerformanceTest() {
    const playground = document.getElementById('animation-playground');
    const fpsDisplay = document.getElementById('fps-value');
    const paintTimeDisplay = document.getElementById('paint-time');
    
    if (playground) playground.innerHTML = '';
    if (fpsDisplay) fpsDisplay.textContent = '--';
    if (paintTimeDisplay) paintTimeDisplay.textContent = '--';
    
    showToast('Performance test cleared', 'info');
}

// ========================================
// FILE STRUCTURE BUILDER
// ========================================
function updateStructure() {
    generateStructure();
}

function generateStructure() {
    const structureType = document.getElementById('structure-type')?.value;
    const fileTree = document.getElementById('file-tree');
    const importCode = document.getElementById('import-code');
    
    if (!structureType || !fileTree || !importCode) return;
    
    const structures = {
        '7-1': {
            tree: `
📁 scss/
├── 📁 abstracts/
│   ├── 📄 _variables.scss
│   ├── 📄 _functions.scss
│   ├── 📄 _mixins.scss
│   └── 📄 _placeholders.scss
├── 📁 base/
│   ├── 📄 _reset.scss
│   ├── 📄 _typography.scss
│   └── 📄 _global.scss
├── 📁 components/
│   ├── 📄 _buttons.scss
│   ├── 📄 _cards.scss
│   └── 📄 _forms.scss
├── 📁 layout/
│   ├── 📄 _header.scss
│   ├── 📄 _footer.scss
│   └── 📄 _sidebar.scss
├── 📁 pages/
│   ├── 📄 _home.scss
│   └── 📄 _about.scss
├── 📁 themes/
│   └── 📄 _default.scss
├── 📁 vendors/
│   └── 📄 _normalize.scss
└── 📄 main.scss
            `,
            imports: `// main.scss
@import 'abstracts/variables';
@import 'abstracts/functions';
@import 'abstracts/mixins';
@import 'abstracts/placeholders';

@import 'vendors/normalize';

@import 'base/reset';
@import 'base/typography';
@import 'base/global';

@import 'layout/header';
@import 'layout/footer';
@import 'layout/sidebar';

@import 'components/buttons';
@import 'components/cards';
@import 'components/forms';

@import 'pages/home';
@import 'pages/about';

@import 'themes/default';`
        },
        'itcss': {
            tree: `
📁 css/
├── 📁 01-settings/
│   ├── 📄 _variables.css
│   └── 📄 _config.css
├── 📁 02-tools/
│   ├── 📄 _mixins.css
│   └── 📄 _functions.css
├── 📁 03-generic/
│   ├── 📄 _reset.css
│   └── 📄 _normalize.css
├── 📁 04-elements/
│   ├── 📄 _headings.css
│   └── 📄 _links.css
├── 📁 05-objects/
│   ├── 📄 _containers.css
│   └── 📄 _grid.css
├── 📁 06-components/
│   ├── 📄 _card.css
│   └── 📄 _button.css
└── 📁 07-utilities/
    ├── 📄 _spacing.css
    └── 📄 _display.css
            `,
            imports: `/* main.css */
@import '01-settings/_variables.css';
@import '01-settings/_config.css';

@import '02-tools/_mixins.css';
@import '02-tools/_functions.css';

@import '03-generic/_reset.css';
@import '03-generic/_normalize.css';

@import '04-elements/_headings.css';
@import '04-elements/_links.css';

@import '05-objects/_containers.css';
@import '05-objects/_grid.css';

@import '06-components/_card.css';
@import '06-components/_button.css';

@import '07-utilities/_spacing.css';
@import '07-utilities/_display.css';`
        },
        'atomic': {
            tree: `
📁 styles/
├── 📁 tokens/
│   ├── 📄 colors.css
│   ├── 📄 typography.css
│   └── 📄 spacing.css
├── 📁 atoms/
│   ├── 📄 button.css
│   ├── 📄 input.css
│   └── 📄 label.css
├── 📁 molecules/
│   ├── 📄 search-form.css
│   └── 📄 card-header.css
├── 📁 organisms/
│   ├── 📄 header.css
│   └── 📄 footer.css
├── 📁 templates/
│   └── 📄 page-layout.css
└── 📁 pages/
    ├── 📄 homepage.css
    └── 📄 about.css
            `,
            imports: `/* main.css */
@import 'tokens/colors.css';
@import 'tokens/typography.css';
@import 'tokens/spacing.css';

@import 'atoms/button.css';
@import 'atoms/input.css';
@import 'atoms/label.css';

@import 'molecules/search-form.css';
@import 'molecules/card-header.css';

@import 'organisms/header.css';
@import 'organisms/footer.css';

@import 'templates/page-layout.css';

@import 'pages/homepage.css';
@import 'pages/about.css';`
        },
        'component': {
            tree: `
📁 src/
├── 📁 styles/
│   ├── 📁 globals/
│   │   ├── 📄 reset.css
│   │   ├── 📄 variables.css
│   │   └── 📄 utilities.css
│   └── 📁 components/
│       ├── 📁 Button/
│       │   ├── 📄 Button.module.css
│       │   └── 📄 index.js
│       └── 📁 Card/
│           ├── 📄 Card.module.css
│           └── 📄 index.js
└── 📁 layouts/
    └── 📁 MainLayout/
        ├── 📄 MainLayout.module.css
        └── 📄 index.js
            `,
            imports: `// App.js or main entry point
import './styles/globals/reset.css';
import './styles/globals/variables.css';
import './styles/globals/utilities.css';

// Component imports
import Button from './components/Button';
import Card from './components/Card';
import MainLayout from './layouts/MainLayout';

// CSS Modules automatically scoped`
        }
    };
    
    const structure = structures[structureType];
    if (structure) {
        fileTree.innerHTML = `<pre>${structure.tree}</pre>`;
        importCode.innerHTML = `<code>${structure.imports}</code>`;
        showToast(`${structureType.toUpperCase()} structure generated!`, 'success');
    }
}

// ========================================
// MOVIE CARD REFACTOR DEMO
// ========================================
function updateCard() {
    const card = document.getElementById('refactored-card');
    const classesOutput = document.getElementById('generated-classes');
    
    if (!card || !classesOutput) return;
    
    // Get current selections
    const isFeatured = document.getElementById('featured-toggle')?.checked;
    const size = document.getElementById('size-select')?.value;
    const isDark = document.getElementById('dark-toggle')?.checked;
    const rating = document.getElementById('rating-select')?.value;
    
    // Reset classes
    card.className = 'c-movie-card';
    
    // Build class list
    const classes = ['c-movie-card'];
    
    // Add modifiers
    if (isFeatured) {
        card.classList.add('c-movie-card--featured');
        classes.push('c-movie-card--featured');
    }
    
    if (size) {
        card.classList.add(`c-movie-card--${size}`);
        classes.push(`c-movie-card--${size}`);
    }
    
    if (isDark) {
        card.classList.add('c-movie-card--dark');
        classes.push('c-movie-card--dark');
    }
    
    // Update rating
    const ratingElement = card.querySelector('.c-movie-card__rating');
    if (ratingElement) {
        ratingElement.className = 'c-movie-card__rating';
        ratingElement.classList.add(`c-movie-card__rating--${rating}`);
        classes.push(`c-movie-card__rating--${rating}`);
        
        // Update rating text based on selection
        const ratingTexts = {
            high: '⭐ 8.4',
            medium: '⭐ 7.2',
            low: '⭐ 5.8'
        };
        ratingElement.textContent = ratingTexts[rating];
    }
    
    // Update classes output
    classesOutput.innerHTML = `<code>${classes.join('\n')}</code>`;
}

// ========================================
// CERTIFICATE DOWNLOAD
// ========================================
function downloadCertificate() {
    // Create a simple certificate
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', canvas.width/2, 150);
    
    ctx.font = '32px Arial';
    ctx.fillText('CSS Best Practices & Industry Methodologies', canvas.width/2, 250);
    
    ctx.font = '24px Arial';
    ctx.fillText('Workshop Day 2', canvas.width/2, 300);
    
    ctx.font = '20px Arial';
    ctx.fillText('You have successfully completed the advanced CSS workshop', canvas.width/2, 400);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, canvas.width/2, 450);
    
    // Download
    const link = document.createElement('a');
    link.download = 'css-workshop-certificate.png';
    link.href = canvas.toDataURL();
    link.click();
    
    showToast('🎉 Certificate downloaded! Congratulations!', 'success', 5000);
}

// ========================================
// SCROLL TO SECTION FUNCTIONALITY
// ========================================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize BEM classes output
    updateBEMClassesOutput();
    
    // Initialize refactor demo
    if (document.getElementById('refactored-card')) {
        updateCard();
    }
    
    // Add smooth scrolling to navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Show welcome message
    setTimeout(() => {
        showToast('🎉 Welcome to CSS Best Practices Workshop!', 'success', 4000);
    }, 1000);
    
    console.log('🚀 CSS Best Practices Workshop initialized!');
    console.log('📚 Ready to learn industry standards from Netflix, Airbnb & Spotify!');
});

// ========================================
// KEYBOARD SHORTCUTS
// ========================================
document.addEventListener('keydown', function(e) {
    // Alt + D for dark mode toggle
    if (e.altKey && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
    }
    
    // Alt + R for random theme
    if (e.altKey && e.key === 'r') {
        e.preventDefault();
        randomizeTheme();
    }
    
    // Alt + C for certificate
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        downloadCertificate();
    }
});

// ========================================
// UTILITY FUNCTIONS
// ========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// ERROR HANDLING
// ========================================
window.addEventListener('error', function(e) {
    console.error('Workshop Error:', e.error);
    showToast('An error occurred. Please refresh the page.', 'error');
});

// ========================================
// PERFORMANCE MONITORING
// ========================================
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = Math.round(perfData.loadEventEnd - perfData.loadEventStart);
            console.log(`🚀 Workshop loaded in ${loadTime}ms`);
            
            if (loadTime > 3000) {
                showToast('Slow loading detected. Consider optimizing your CSS!', 'warning');
            }
        }, 1000);
    });
}
