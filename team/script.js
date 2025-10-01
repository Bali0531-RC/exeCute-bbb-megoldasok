class TeamWebsite {
    constructor() {
        this.images = [];
        this.currentImageIndex = 0;
        this.isTransitioning = false;
        this.theme = localStorage.getItem('theme') || 'dark';
        
        this.loadImages();
        this.init();
    }

    loadImages() {
        let imageIndex = 1;
        const testImage = (index) => {
            const img = new Image();
            img.onload = () => {
                this.images.push(`img${index}.jpeg`);
                testImage(index + 1);
            };
            img.onerror = () => {
                if (this.images.length === 0) {
                    this.images = ["bali.png", "fules.png", "zsir.png"];
                }
            };
            img.src = `img${index}.jpeg`;
        };
        testImage(imageIndex);
    }

    init() {
        this.initClock();
        this.initImageGallery();
        this.initMemberCards();
        this.initTheme();
        this.initNavigation();
        this.initResponsive();
    }

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
        if (this.isTransitioning) return;
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.showCurrentImage();
    }

    prevImage() {
        if (this.isTransitioning) return;
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        this.showCurrentImage();
    }

    showCurrentImage() {
        const imgElement = document.getElementById('overlayImage');
        const counter = document.getElementById('imageCounter');
        
        this.isTransitioning = true;
        
        const newImg = new Image();
        newImg.onload = () => {
            imgElement.style.opacity = '0';
            
            setTimeout(() => {
                imgElement.src = newImg.src;
                counter.textContent = `${this.currentImageIndex + 1} / ${this.images.length}`;
                imgElement.style.opacity = '1';
                
                setTimeout(() => {
                    this.isTransitioning = false;
                }, 200);
            }, 100);
        };
        
        newImg.src = this.images[this.currentImageIndex];
    }

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

    initNavigation() {
        const backButton = document.getElementById('visszaGomb');
        backButton?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '../index.html';
        });
    }

    initResponsive() {
        this.createMobileMenuToggle();
        
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        });
    }

    createMobileMenuToggle() {
        if (document.querySelector('.mobile-menu-toggle')) return;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-menu-toggle';
        toggleBtn.innerHTML = '☰';
        toggleBtn.setAttribute('aria-label', 'Menü megnyitása');
        document.body.appendChild(toggleBtn);
        
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        
        toggleBtn.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        overlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });
        
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMobileMenu();
                }
            });
        });
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
        
        if (sidebar.classList.contains('mobile-open')) {
            toggleBtn.innerHTML = '✕';
            toggleBtn.setAttribute('aria-label', 'Menü bezárása');
            document.body.style.overflow = 'hidden';
        } else {
            toggleBtn.innerHTML = '☰';
            toggleBtn.setAttribute('aria-label', 'Menü megnyitása');
            document.body.style.overflow = '';
        }
    }

    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
        if (toggleBtn) {
            toggleBtn.innerHTML = '☰';
            toggleBtn.setAttribute('aria-label', 'Menü megnyitása');
        }
        document.body.style.overflow = '';
    }

    initMobileMenu() {
        console.log('Mobile view initialized');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TeamWebsite();
});

const Utils = {
    smoothScrollTo: (element, duration = 800) => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    },

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