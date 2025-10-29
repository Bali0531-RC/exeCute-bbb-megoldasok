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

let numbers = [];

document.getElementById('addBtn').addEventListener('click', addNumber);
document.getElementById('resetBtn').addEventListener('click', reset);
document.getElementById('numberInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addNumber();
});

function addNumber() {
    const input = document.getElementById('numberInput');
    const value = parseInt(input.value);
    
    if (isNaN(value)) {
        alert('Kérlek, írj be egy számot!');
        return;
    }
    
    if (value < 0) {
        if (numbers.length === 0) {
            alert('Először adj meg pozitív számokat!');
            return;
        }
        findLongestIncreasing();
        return;
    }
    
    numbers.push(value);
    input.value = '';
    updateDisplay();
}

function updateDisplay() {
    const numbersList = document.getElementById('numbersList');
    numbersList.innerHTML = '';
    
    numbers.forEach(num => {
        const span = document.createElement('span');
        span.className = 'number-item';
        span.textContent = num;
        numbersList.appendChild(span);
    });
}

function findLongestIncreasing() {
    if (numbers.length === 0) {
        document.getElementById('result').textContent = 'Add meg a számokat!';
        return;
    }
    
    let longest = [];
    let current = [numbers[0]];
    
    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] > numbers[i - 1]) {
            current.push(numbers[i]);
        } else {
            if (current.length > longest.length) {
                longest = [...current];
            }
            current = [numbers[i]];
        }
    }
    
    if (current.length > longest.length) {
        longest = [...current];
    }
    
    document.getElementById('result').textContent = 
        'Leghosszabb emelkedő részsorozat (' + longest.length + ' elem): ' + longest.join(', ');
}

function reset() {
    numbers = [];
    document.getElementById('numberInput').value = '';
    document.getElementById('numbersList').innerHTML = '';
    document.getElementById('result').textContent = '';
}
