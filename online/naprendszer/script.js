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

const canvas = document.getElementById('solarSystem');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let planets = [];
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

function generateSolarSystem() {
    planets = [];
    const planetCount = Math.floor(Math.random() * 3) + 5;
    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 50;
    
    for (let i = 0; i < planetCount; i++) {
        const baseDistance = 60 + i * 50;
        const distance = Math.min(baseDistance + (Math.random() - 0.5) * 20, maxRadius);
        
        const planet = {
            distance: distance,
            size: 6 + Math.random() * 8,
            speed: 0.0004 + Math.random() * 0.0008,
            angle: Math.random() * Math.PI * 2,
            color: 'hsl(' + Math.floor(Math.random() * 360) + ', 75%, 65%)',
            moons: []
        };
        
        const moonCount = Math.floor(Math.random() * 2);
        for (let j = 0; j < moonCount; j++) {
            planet.moons.push({
                distance: planet.size + 10 + j * 8,
                size: 2 + Math.random() * 2.5,
                speed: 0.025 + Math.random() * 0.03,
                angle: Math.random() * Math.PI * 2
            });
        }
        
        planets.push(planet);
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }
    
    planets.forEach(planet => {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, planet.distance, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    ctx.fillStyle = '#FDB813';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fill();
    
    planets.forEach(planet => {
        planet.angle += planet.speed;
        const x = centerX + Math.cos(planet.angle) * planet.distance;
        const y = centerY + Math.sin(planet.angle) * planet.distance;
        
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(x, y, planet.size, 0, Math.PI * 2);
        ctx.fill();
        
        planet.moons.forEach(moon => {
            moon.angle += moon.speed;
            const moonX = x + Math.cos(moon.angle) * moon.distance;
            const moonY = y + Math.sin(moon.angle) * moon.distance;
            
            ctx.fillStyle = '#aaa';
            ctx.beginPath();
            ctx.arc(moonX, moonY, moon.size, 0, Math.PI * 2);
            ctx.fill();
        });
    });
    
    requestAnimationFrame(draw);
}

document.getElementById('regenerateBtn').addEventListener('click', () => {
    generateSolarSystem();
});

generateSolarSystem();
draw();
