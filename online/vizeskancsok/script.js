document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = '../../index.html';
});

const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.querySelector('.icon').textContent = currentTheme === 'dark' ? '🌙' : '☀️';

themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.querySelector('.icon').textContent = theme === 'dark' ? '🌙' : '☀️';
});

let jug9 = 0;
let jug4 = 0;
let steps = 0;

function updateDisplay() {
    document.getElementById('amount9').textContent = `${jug9} L`;
    document.getElementById('amount4').textContent = `${jug4} L`;
    
    const water9Height = (jug9 / 9) * 100;
    const water4Height = (jug4 / 4) * 100;
    
    document.getElementById('water9').style.height = `${water9Height}%`;
    document.getElementById('water4').style.height = `${water4Height}%`;
    
    document.getElementById('steps').textContent = steps;
    
    if (jug9 === 6) {
        document.getElementById('finalSteps').textContent = steps;
        document.getElementById('success').classList.remove('hidden');
    }
}

function fill(capacity) {
    if (capacity === 9) {
        if (jug9 === 9) return;
        jug9 = 9;
    } else {
        if (jug4 === 4) return;
        jug4 = 4;
    }
    steps++;
    updateDisplay();
}

function empty(capacity) {
    if (capacity === 9) {
        if (jug9 === 0) return;
        jug9 = 0;
    } else {
        if (jug4 === 0) return;
        jug4 = 0;
    }
    steps++;
    updateDisplay();
}

function pour(from, to) {
    if (from === 9 && to === 4) {
        if (jug9 === 0 || jug4 === 4) return;
        const available = jug9;
        const space = 4 - jug4;
        const transfer = Math.min(available, space);
        jug9 -= transfer;
        jug4 += transfer;
    } else if (from === 4 && to === 9) {
        if (jug4 === 0 || jug9 === 9) return;
        const available = jug4;
        const space = 9 - jug9;
        const transfer = Math.min(available, space);
        jug4 -= transfer;
        jug9 += transfer;
    }
    steps++;
    updateDisplay();
}

function reset() {
    jug9 = 0;
    jug4 = 0;
    steps = 0;
    document.getElementById('success').classList.add('hidden');
    updateDisplay();
}

updateDisplay();
