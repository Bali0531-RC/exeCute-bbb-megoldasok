// Theme and navigation
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

// Robot simulation
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const gridSizeInput = document.getElementById('gridSize');
const turnTypeSelect = document.getElementById('turnType');

let gridSize = 8;
let cellSize = 40;
let grid = [];
let robot = { x: 0, y: 0, direction: 0 };
let isRunning = false;
let steps = 0;
let intervalId = null;

const directions = ['↑', '→', '↓', '←'];
const directionNames = ['Fel', 'Jobbra', 'Le', 'Balra'];
const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];

function createGrid() {
    stopSimulation();
    gridSize = parseInt(gridSizeInput.value);
    gridSize = Math.max(5, Math.min(20, gridSize));
    gridSizeInput.value = gridSize;
    
    const maxCanvasSize = Math.min(700, window.innerWidth * 0.85);
    cellSize = maxCanvasSize / gridSize;
    canvas.width = maxCanvasSize;
    canvas.height = maxCanvasSize;
    
    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);
    robot = { x: centerX, y: centerY, direction: 0 };
    steps = 0;
    
    updateDisplay();
    drawGrid();
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const theme = document.documentElement.getAttribute('data-theme');
    ctx.strokeStyle = theme === 'dark' ? '#223352' : '#cbd5e1';
    ctx.lineWidth = 1;
    
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);
    
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const px = x * cellSize;
            const py = y * cellSize;
            
            const isCenter = (x === centerX && y === centerY);
            ctx.fillStyle = isCenter ? 'rgba(163, 255, 18, 0.1)' : 'rgba(15, 23, 42, 0.5)';
            ctx.fillRect(px, py, cellSize, cellSize);
            
            ctx.strokeRect(px, py, cellSize, cellSize);
            
            if (grid[y][x]) {
                ctx.font = cellSize * 0.6 + 'px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                if (grid[y][x] === 'left') {
                    ctx.fillStyle = '#fbbf24';
                    ctx.fillText('↰', px + cellSize / 2, py + cellSize / 2);
                } else if (grid[y][x] === 'right') {
                    ctx.fillStyle = '#22d3ee';
                    ctx.fillText('↱', px + cellSize / 2, py + cellSize / 2);
                } else if (grid[y][x] === 'uturn') {
                    ctx.fillStyle = '#f87171';
                    ctx.fillText('↶', px + cellSize / 2, py + cellSize / 2);
                }
            }
        }
    }
    
    const rx = robot.x * cellSize;
    const ry = robot.y * cellSize;
    
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.arc(rx + cellSize / 2, ry + cellSize / 2, cellSize * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.font = cellSize * 0.5 + 'px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(directions[robot.direction], rx + cellSize / 2, ry + cellSize / 2);
}

function updateDisplay() {
    document.getElementById('position').textContent = '(' + robot.x + ', ' + robot.y + ')';
    document.getElementById('direction').textContent = directions[robot.direction] + ' ' + directionNames[robot.direction];
    document.getElementById('steps').textContent = steps;
}

canvas.addEventListener('click', (e) => {
    if (isRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / cellSize);
    const y = Math.floor((e.clientY - rect.top) * scaleY / cellSize);
    
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        if (x === robot.x && y === robot.y) return;
        
        const turnType = turnTypeSelect.value;
        
        if (grid[y][x] === turnType) {
            grid[y][x] = null;
        } else {
            grid[y][x] = turnType;
        }
        
        drawGrid();
    }
});

function startSimulation() {
    if (isRunning) return;
    isRunning = true;
    
    intervalId = setInterval(() => {
        const currentCell = grid[robot.y][robot.x];
        if (currentCell) {
            if (currentCell === 'left') {
                robot.direction = (robot.direction + 3) % 4;
            } else if (currentCell === 'right') {
                robot.direction = (robot.direction + 1) % 4;
            } else if (currentCell === 'uturn') {
                robot.direction = (robot.direction + 2) % 4;
            }
        }
        
        const nextX = robot.x + dx[robot.direction];
        const nextY = robot.y + dy[robot.direction];
        
        if (nextX >= 0 && nextX < gridSize && nextY >= 0 && nextY < gridSize) {
            robot.x = nextX;
            robot.y = nextY;
            steps++;
        } else {
            stopSimulation();
        }
        
        updateDisplay();
        drawGrid();
    }, 1000);
}

function stopSimulation() {
    isRunning = false;
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function resetSimulation() {
    stopSimulation();
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);
    robot = { x: centerX, y: centerY, direction: 0 };
    steps = 0;
    updateDisplay();
    drawGrid();
}

document.getElementById('createGridBtn').addEventListener('click', createGrid);
document.getElementById('startBtn').addEventListener('click', startSimulation);
document.getElementById('stopBtn').addEventListener('click', stopSimulation);
document.getElementById('resetBtn').addEventListener('click', resetSimulation);

createGrid();
