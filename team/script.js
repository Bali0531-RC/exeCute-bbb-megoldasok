class TeamWebsite {
    constructor() {
        this.images = ["N.png", "L.png", "G.png"];
        this.currentImageIndex = 0;
        this.isTransitioning = false;
        this.theme = localStorage.getItem('theme') || 'dark';
        
        this.init();
    }

    init() {
        this.initClock();
        this.initImageGallery();
        this.initMemberCards();
        this.initTheme();
        this.initNavigation();
        this.initResponsive();
    }

    // Modern clock with better formatting
    initClock() {
        const clockElement = document.getElementById('current-time');
        if (!clockElement) return;

    this.clockBases = [2, 10];
    this.clockBaseIndex = 0;

        clockElement.setAttribute('role', 'button');
        clockElement.setAttribute('tabindex', '0');

        const updateTime = () => {
            const base = this.clockBases[this.clockBaseIndex];
            const formatted = this.formatClockTime(base);
            const baseLabel = this.getBaseLabel(base);
            clockElement.textContent = formatted;
            clockElement.dataset.baseLabel = `${baseLabel}`;
            clockElement.title = `Kattints a számrendszer váltásához (aktuális: ${baseLabel})`;
            clockElement.setAttribute('aria-label', `Aktuális idő: ${formatted} – ${baseLabel}. Kattints vagy nyomd meg az Enter / Szóköz billentyűt a váltáshoz.`);
        };

        clockElement.addEventListener('click', () => {
            this.clockBaseIndex = (this.clockBaseIndex + 1) % this.clockBases.length;
            updateTime();
        });

        clockElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.clockBaseIndex = (this.clockBaseIndex + 1) % this.clockBases.length;
                updateTime();
            }
        });

        updateTime();
        setInterval(updateTime, 1000);
    }

    formatClockTime(base) {
        const now = new Date();
        const hours = this.formatClockComponent(now.getHours(), base, 24);
        const minutes = this.formatClockComponent(now.getMinutes(), base, 60);
        const seconds = this.formatClockComponent(now.getSeconds(), base, 60);
        return `${hours} : ${minutes} : ${seconds}`;
    }

    formatClockComponent(value, base, maxValue) {
        if (base === 2) {
            const length = Math.ceil(Math.log2(maxValue));
            return value.toString(2).padStart(length, '0');
        }

        return value.toString(10).padStart(2, '0');
    }

    getBaseLabel(base) {
        if (base === 2) {
            return '2-es (bináris)';
        }

        return '10-es';
    }

    // Enhanced image gallery with better UX
    initImageGallery() {
        const modal = document.getElementById('imageOverlay');
        const openBtn = document.getElementById('openOverlay');
        const closeBtn = document.getElementById('closeOverlay');
        const backdrop = document.getElementById('modalBackdrop');
        const nextBtn = document.getElementById('nextImage');
        const prevBtn = document.getElementById('prevImage');
        const counter = document.getElementById('imageCounter');

        openBtn?.addEventListener('click', () => this.openGallery());
        closeBtn?.addEventListener('click', () => this.closeGallery());
        backdrop?.addEventListener('click', () => this.closeGallery());
        nextBtn?.addEventListener('click', () => this.nextImage());
        prevBtn?.addEventListener('click', () => this.prevImage());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('show')) {
                if (e.key === 'Escape') {
                    this.closeGallery();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextImage();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prevImage();
                }
            }
        });
    }

    openGallery() {
        const modal = document.getElementById('imageOverlay');
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.showCurrentImage();
    }

    closeGallery() {
        const modal = document.getElementById('imageOverlay');
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    nextImage() {
        if (this.isTransitioning) return; // Prevent multiple clicks during transition
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.showCurrentImage();
    }

    prevImage() {
        if (this.isTransitioning) return; // Prevent multiple clicks during transition
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        this.showCurrentImage();
    }

    showCurrentImage() {
        const imgElement = document.getElementById('overlayImage');
        const counter = document.getElementById('imageCounter');
        
        // Set transitioning flag
        this.isTransitioning = true;
        
        // Create new image element to preload
        const newImg = new Image();
        newImg.onload = () => {
            // Quick fade transition
            imgElement.style.opacity = '0';
            
            setTimeout(() => {
                imgElement.src = newImg.src;
                counter.textContent = `${this.currentImageIndex + 1} / ${this.images.length}`;
                imgElement.style.opacity = '1';
                
                // Reset transitioning flag after animation
                setTimeout(() => {
                    this.isTransitioning = false;
                }, 200);
            }, 100);
        };
        
        // Start loading the new image
        newImg.src = this.images[this.currentImageIndex];
    }

    // Enhanced member card interactions
    initMemberCards() {
        const toggleButtons = document.querySelectorAll('.intro-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('data-target');
                const targetIntro = document.getElementById(targetId);
                const buttonIcon = button.querySelector('.button-icon');
                
                if (targetIntro) {
                    const isVisible = targetIntro.classList.contains('show');
                    
                    // Close all other intros
                    document.querySelectorAll('.member-intro').forEach(intro => {
                        intro.classList.remove('show');
                    });
                    document.querySelectorAll('.intro-toggle').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    if (!isVisible) {
                        targetIntro.classList.add('show');
                        button.classList.add('active');
                    }
                }
            });
        });
    }

    // Theme switching functionality
    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        this.applyTheme(this.theme);
        
        themeToggle?.addEventListener('click', () => {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            this.applyTheme(this.theme);
            localStorage.setItem('theme', this.theme);
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('#themeToggle .icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Navigation handling
    initNavigation() {
        const backButton = document.getElementById('visszaGomb');
        backButton?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '../index.html';
        });
    }

    // Mobile responsive functionality
    initResponsive() {
        // Add mobile menu toggle if needed
        if (window.innerWidth <= 768) {
            this.initMobileMenu();
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                this.initMobileMenu();
            }
        });
    }

    initMobileMenu() {
        // Mobile sidebar toggle functionality could be added here
        console.log('Mobile view initialized');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TeamWebsite();
});

// Add some utility functions for better UX
const Utils = {
    // Smooth scroll utility
    smoothScrollTo: (element, duration = 800) => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    },

    // Debounce utility for performance
    debounce: (func, wait) => {
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
};