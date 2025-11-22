class TemplateApp {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        this.initTheme();
        this.bindEvents();
    }

    initTheme() {
        this.applyTheme(this.theme);
        
        const themeToggle = document.getElementById('themeToggle');
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

    bindEvents() {
        // Vissza a főoldalra gomb
        const backButton = document.getElementById('backButton');
        backButton?.addEventListener('click', () => {
            window.location.href = '../index.html';
        });

        // AJAX teszt gomb
        const testAjaxBtn = document.getElementById('testAjaxBtn');
        testAjaxBtn?.addEventListener('click', () => {
            this.testAjax();
        });
    }

    testAjax() {
        const resultDiv = document.getElementById('testResult');
        resultDiv.innerHTML = '<p class="loading">⏳ Kérés küldése...</p>';

        const xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resultDiv.innerHTML = `
                            <div class="success">
                                <p><strong>✅ Sikeres válasz!</strong></p>
                                <p><strong>Státusz:</strong> ${xhr.status}</p>
                                <p><strong>Kapott adat:</strong></p>
                                <pre>${JSON.stringify(data, null, 2)}</pre>
                            </div>
                        `;
                    } catch (e) {
                        resultDiv.innerHTML = `
                            <div class="error">
                                <p><strong>❌ JSON parse hiba!</strong></p>
                                <p>${e.message}</p>
                            </div>
                        `;
                    }
                } else {
                    resultDiv.innerHTML = `
                        <div class="error">
                            <p><strong>❌ Hiba történt!</strong></p>
                            <p><strong>Státusz:</strong> ${xhr.status}</p>
                            <p><strong>Válasz:</strong> ${xhr.responseText || 'Nincs válasz'}</p>
                        </div>
                    `;
                }
            }
        };

        // Teszt API endpoint (JSONPlaceholder)
        xhr.open('GET', 'https://jsonplaceholder.typicode.com/users/1', true);
        xhr.send();
    }
}

// Inicializálás DOM betöltése után
document.addEventListener('DOMContentLoaded', () => {
    new TemplateApp();
});

// Service Worker regisztráció (opcionális)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(err => console.log('SW registration failed:', err));
    });
}
