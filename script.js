/**
 * Portfolio Website JavaScript
 * Handles all interactive functionality
 */

// ===== Configuration =====
const GITHUB_USERNAME = '20obb';
const REFRESH_INTERVAL = 60000; // Auto-refresh every 60 seconds

// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');
const backToTop = document.getElementById('back-to-top');
const typingText = document.getElementById('typing-text');
const tabBtns = document.querySelectorAll('.tab-btn');
const skillsPanels = document.querySelectorAll('.skills-panel');
const contactForm = document.getElementById('contact-form');

// ===== GitHub Projects =====
const languageIcons = {
    'JavaScript': 'fab fa-js-square',
    'Python': 'fab fa-python',
    'C': 'fas fa-code',
    'C++': 'fas fa-cogs',
    'Rust': 'fab fa-rust',
    'HTML': 'fab fa-html5',
    'CSS': 'fab fa-css3-alt',
    'TypeScript': 'fas fa-code',
    'Shell': 'fas fa-terminal',
    'Go': 'fas fa-code',
    'Java': 'fab fa-java',
    'Swift': 'fab fa-swift',
    'Objective-C': 'fab fa-apple',
    'default': 'fas fa-folder-open'
};

const gradientColors = [
    'gradient-1', 'gradient-2', 'gradient-3', 
    'gradient-4', 'gradient-5', 'gradient-6'
];

// Fallback projects when GitHub API fails
const fallbackProjects = [
    {
        name: 'View My GitHub',
        description: 'Check out all my repositories and projects on GitHub.',
        language: 'C',
        html_url: `https://github.com/${GITHUB_USERNAME}`,
        stargazers_count: 0,
        forks_count: 0,
        topics: ['github', 'portfolio']
    }
];

async function fetchGitHubRepos() {
    const projectsGrid = document.getElementById('github-projects');
    
    try {
        // Add cache-busting timestamp to force fresh data
        const timestamp = new Date().getTime();
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30&_=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const repos = await response.json();
        
        // Clear loading state
        projectsGrid.innerHTML = '';
        
        if (repos.length === 0) {
            projectsGrid.innerHTML = '<p class="no-projects">No public repositories found.</p>';
            return;
        }
        
        // Create project cards
        repos.forEach((repo, index) => {
            const card = createProjectCard(repo, index);
            projectsGrid.appendChild(card);
        });
        
        // Re-initialize filter buttons
        initProjectFilters();
        
        console.log(`✓ Loaded ${repos.length} repos at ${new Date().toLocaleTimeString()}`);
        
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        // Show fallback projects instead of error
        projectsGrid.innerHTML = '';
        fallbackProjects.forEach((repo, index) => {
            const card = createProjectCard(repo, index);
            projectsGrid.appendChild(card);
        });
        initProjectFilters();
        console.log('Using fallback projects due to API error');
    }
}

function createProjectCard(repo, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-category', repo.language || 'Other');
    
    const icon = languageIcons[repo.language] || languageIcons['default'];
    const gradient = gradientColors[index % gradientColors.length];
    const description = repo.description || 'No description provided.';
    const topics = repo.topics || [];
    
    card.innerHTML = `
        <div class="project-image">
            <div class="project-placeholder ${gradient}">
                <i class="${icon}"></i>
            </div>
            <div class="project-overlay">
                <div class="project-links">
                    ${repo.homepage ? `
                        <a href="${repo.homepage}" target="_blank" class="project-link" aria-label="View Live">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    ` : ''}
                    <a href="${repo.html_url}" target="_blank" class="project-link" aria-label="View Code">
                        <i class="fab fa-github"></i>
                    </a>
                </div>
            </div>
        </div>
        <div class="project-info">
            <h3>${repo.name}</h3>
            <p>${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>
            <div class="project-meta">
                ${repo.language ? `<span class="project-lang"><i class="${icon}"></i> ${repo.language}</span>` : ''}
                <span class="project-stars"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                <span class="project-forks"><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
            </div>
            <div class="project-tags">
                ${repo.language ? `<span>${repo.language}</span>` : ''}
                ${topics.slice(0, 2).map(topic => `<span>${topic}</span>`).join('')}
                ${repo.fork ? '<span>Fork</span>' : ''}
            </div>
        </div>
    `;
    
    return card;
}

function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter projects
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// Auto-refresh projects
function startAutoRefresh() {
    setInterval(() => {
        console.log('Auto-refreshing GitHub projects...');
        fetchGitHubRepos();
    }, REFRESH_INTERVAL);
}

// ===== Typing Animation =====
class TypeWriter {
    constructor(element, words, wait = 3000) {
        this.element = element;
        this.words = words;
        this.wait = parseInt(wait, 10);
        this.txt = '';
        this.wordIndex = 0;
        this.isDeleting = false;
        this.type();
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.element.innerHTML = this.txt;

        let typeSpeed = 100;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ===== Initialize Typing Animation =====
document.addEventListener('DOMContentLoaded', () => {
    const words = [
        'Software Developer',
        'Full-Stack Engineer',
        'Problem Solver',
        'Code Enthusiast'
    ];

    if (typingText) {
        new TypeWriter(typingText, words, 2000);
    }
});

// ===== Navigation Scroll Effect =====
function handleNavScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// ===== Mobile Menu Toggle =====
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== Active Navigation Link on Scroll =====
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ===== Theme Toggle =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

themeToggle.addEventListener('click', toggleTheme);

// ===== Back to Top Button =====
function handleBackToTop() {
    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== Skills Tabs =====
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Update active button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active panel
        skillsPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === targetTab) {
                panel.classList.add('active');
                // Animate skill bars
                animateSkillBars(panel);
            }
        });
    });
});

// ===== Skill Bars Animation =====
function animateSkillBars(container) {
    const skillCards = container.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('animated');
        }, index * 100);
    });
}

// ===== Contact Form =====
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Simple validation
    if (!data.name || !data.email || !data.message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Simulate form submission
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        contactForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
});

// ===== Notification System =====
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Styles
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%) translateY(100px)',
        padding: '16px 24px',
        background: type === 'success' ? '#10b981' : '#ef4444',
        color: 'white',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.95rem',
        fontWeight: '500',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        zIndex: '9999',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ===== Scroll Animations (Intersection Observer) =====
function initScrollAnimations() {
    // Animate skill progress bars when visible
    const skillCards = document.querySelectorAll('.skill-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Special handling for skill cards
                const progress = entry.target.querySelector('.skill-progress');
                if (progress) {
                    setTimeout(() => {
                        progress.style.width = progress.style.getPropertyValue('--progress');
                    }, 200);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px 0px 0px'
    });
    
    skillCards.forEach(el => {
        observer.observe(el);
    });
}

// ===== Animate elements when they become visible =====
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        
        if (isVisible) {
            el.classList.add('animated');
        }
    });
}

// ===== Smooth Scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

// ===== Parallax Effect for Hero =====
function handleParallax() {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    
    if (hero && scrolled < window.innerHeight) {
        const heroContent = hero.querySelector('.hero-content');
        const heroImage = hero.querySelector('.hero-image');
        
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - scrolled * 0.002;
        }
        
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    }
}

// ===== Cursor Effect (Optional - for desktop) =====
function initCursorEffect() {
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        
        Object.assign(cursor.style, {
            position: 'fixed',
            width: '20px',
            height: '20px',
            border: '2px solid var(--primary)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: '9999',
            transition: 'transform 0.1s ease, width 0.2s ease, height 0.2s ease',
            transform: 'translate(-50%, -50%)'
        });
        
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        // Hover effect on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .project-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '40px';
                cursor.style.height = '40px';
                cursor.style.background = 'rgba(99, 102, 241, 0.1)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.background = 'transparent';
            });
        });
    }
}

// ===== Initialize Everything =====
function init() {
    initTheme();
    initScrollAnimations();
    
    // Load GitHub projects
    fetchGitHubRepos();
    
    // Start auto-refresh for GitHub projects
    startAutoRefresh();
    
    // Initial animations for visible skill cards
    const activePanel = document.querySelector('.skills-panel.active');
    if (activePanel) {
        setTimeout(() => animateSkillBars(activePanel), 500);
    }
}

// ===== Event Listeners =====
window.addEventListener('scroll', () => {
    handleNavScroll();
    updateActiveNavLink();
    handleBackToTop();
    handleScrollAnimations();
    handleParallax();
});

window.addEventListener('load', init);

// ===== Debounce utility =====
function debounce(func, wait = 10) {
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

// ===== Preloader (Optional) =====
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// ===== Console Easter Egg =====
console.log(`
%c👋 Hello, curious developer!

%cInterested in working together?
Let's connect!

🌐 Portfolio: johndoe.com
📧 Email: hello@johndoe.com
💼 LinkedIn: linkedin.com/in/johndoe
`,
'font-size: 20px; font-weight: bold; color: #6366f1;',
'font-size: 14px; color: #475569;'
);
