class TeamWebsite {
    constructor() {
        this.images = ["N.png", "L.png", "G.png"];
        this.currentImageIndex = 0;
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
        
        const updateTime = () => {
            const now = new Date();
            const options = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            clockElement.textContent = now.toLocaleTimeString('hu-HU', options);
        };

        updateTime();
        setInterval(updateTime, 1000);
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
                switch(e.key) {
                    case 'Escape':
                        this.closeGallery();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                    case 'ArrowLeft':
                        this.prevImage();
                        break;
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
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.showCurrentImage();
    }

    prevImage() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        this.showCurrentImage();
    }

    showCurrentImage() {
        const imgElement = document.getElementById('overlayImage');
        const counter = document.getElementById('imageCounter');
        
        imgElement.src = this.images[this.currentImageIndex];
        counter.textContent = `${this.currentImageIndex + 1} / ${this.images.length}`;
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