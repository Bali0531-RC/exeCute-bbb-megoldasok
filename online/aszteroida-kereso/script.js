const backButton = document.getElementById('backButton');
const themeToggle = document.getElementById('themeToggle');

backButton.addEventListener('click', () => {
    window.location.href = '../../index.html';
});

const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.querySelector('.icon').textContent = savedTheme === 'dark' ? '🌙' : '☀️';

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.querySelector('.icon').textContent = newTheme === 'dark' ? '🌙' : '☀️';
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const spotlight = document.getElementById('spotlight');
const gameContainer = document.querySelector('.game-container');

canvas.width = gameContainer.clientWidth;
canvas.height = gameContainer.clientHeight;

let asteroids = [];
let score = 0;
let mistakes = 0;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
const SPOTLIGHT_RADIUS = 100;
const ASTEROID_COUNT = 15;

class Asteroid {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 15 + Math.random() * 25;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.hasOre = Math.random() < 0.4;
        this.color = this.hasOre ? this.getRandomOreColor() : '#666';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    }

    getRandomOreColor() {
        const colors = ['#f59e0b', '#eab308', '#f97316', '#fb923c', '#fdba74'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
    }

    draw() {
        const distance = Math.sqrt(Math.pow(this.x - mouseX, 2) + Math.pow(this.y - mouseY, 2));
        
        if (distance < SPOTLIGHT_RADIUS) {
            const alpha = 1 - (distance / SPOTLIGHT_RADIUS) * 0.5;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = alpha;
            
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const points = 8;
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const radius = this.size * (i % 2 === 0 ? 1 : 0.6);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            
            if (this.hasOre) {
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = alpha * 0.8;
                ctx.beginPath();
                ctx.arc(this.size * 0.3, -this.size * 0.2, this.size * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }

    isClicked(x, y) {
        const distance = Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
        return distance < this.size;
    }
}

function init() {
    asteroids = [];
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        asteroids.push(new Asteroid());
    }
}

function update() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }

    asteroids.forEach(asteroid => {
        asteroid.update();
        asteroid.draw();
    });

    requestAnimationFrame(update);
}

gameContainer.addEventListener('mousemove', (e) => {
    const rect = gameContainer.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    spotlight.style.left = mouseX + 'px';
    spotlight.style.top = mouseY + 'px';
});

gameContainer.addEventListener('click', (e) => {
    const rect = gameContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let hitAsteroid = null;
    for (let asteroid of asteroids) {
        if (asteroid.isClicked(clickX, clickY)) {
            const distance = Math.sqrt(Math.pow(asteroid.x - mouseX, 2) + Math.pow(asteroid.y - mouseY, 2));
            if (distance < SPOTLIGHT_RADIUS) {
                hitAsteroid = asteroid;
                break;
            }
        }
    }

    if (hitAsteroid) {
        if (hitAsteroid.hasOre) {
            score++;
            document.getElementById('score').textContent = score;
            asteroids.splice(asteroids.indexOf(hitAsteroid), 1);
            asteroids.push(new Asteroid());
        } else {
            mistakes++;
            document.getElementById('mistakes').textContent = mistakes;
        }
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    score = 0;
    mistakes = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('mistakes').textContent = mistakes;
    init();
});

init();
update();
