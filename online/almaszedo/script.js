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

const GRID_SIZE = 6;
const MAX_APPLES = 5;
const MAX_STEPS = 15;

let grid = [];
let appleCount = 0;

function initGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    grid = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (row === 0 && col === 0) {
                cell.classList.add('start');
                cell.textContent = '🧑';
            }
            
            cell.addEventListener('click', () => toggleApple(row, col));
            gridElement.appendChild(cell);
            grid[row][col] = { hasApple: false, element: cell };
        }
    }
    
    appleCount = 0;
    updateAppleCount();
}

function toggleApple(row, col) {
    if (row === 0 && col === 0) return;
    
    const cell = grid[row][col];
    
    if (cell.hasApple) {
        cell.hasApple = false;
        cell.element.textContent = '';
        cell.element.classList.remove('has-apple');
        appleCount--;
    } else {
        if (appleCount >= MAX_APPLES) {
            alert('Maximum ' + MAX_APPLES + ' alma helyezhető el!');
            return;
        }
        cell.hasApple = true;
        cell.element.textContent = '🍎';
        cell.element.classList.add('has-apple');
        appleCount++;
    }
    
    updateAppleCount();
    clearPath();
}

function updateAppleCount() {
    document.getElementById('appleCount').textContent = appleCount + ' / ' + MAX_APPLES;
}

function clearPath() {
    document.getElementById('pathInfo').textContent = '';
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            grid[row][col].element.classList.remove('path');
            const stepNum = grid[row][col].element.querySelector('.step-number');
            if (stepNum) stepNum.remove();
        }
    }
}

function findPath() {
    if (appleCount === 0) {
        document.getElementById('pathInfo').textContent = 'Helyezz el legalább 1 almát!';
        return;
    }
    
    clearPath();
    
    const applePositions = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col].hasApple) {
                applePositions.push({ row, col });
            }
        }
    }
    
    let bestPath = null;
    let maxApples = 0;
    
    function permute(arr) {
        if (arr.length <= 1) return [arr];
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
            const perms = permute(remaining);
            for (const perm of perms) {
                result.push([current].concat(perm));
            }
        }
        return result;
    }
    
    const permutations = permute(applePositions);
    
    for (const order of permutations) {
        const path = [];
        let currentRow = 0;
        let currentCol = 0;
        let steps = 0;
        let collected = 0;
        
        for (const apple of order) {
            const subPath = findShortestPath(currentRow, currentCol, apple.row, apple.col);
            if (steps + subPath.length > MAX_STEPS) break;
            
            path.push(...subPath);
            steps += subPath.length;
            collected++;
            currentRow = apple.row;
            currentCol = apple.col;
        }
        
        if (collected > maxApples || (collected === maxApples && path.length < (bestPath?.length || Infinity))) {
            maxApples = collected;
            bestPath = path;
        }
    }
    
    if (bestPath && bestPath.length > 0) {
        displayPath(bestPath);
        document.getElementById('pathInfo').textContent = 
            'Útvonal megtalálva! ' + maxApples + ' alma összeszedhető ' + bestPath.length + ' lépésben.';
    } else {
        document.getElementById('pathInfo').textContent = 'Nem található útvonal 15 lépésen belül.';
    }
}

function findShortestPath(startRow, startCol, endRow, endCol) {
    const path = [];
    let row = startRow;
    let col = startCol;
    
    while (row !== endRow) {
        if (row < endRow) row++;
        else row--;
        path.push({ row, col });
    }
    
    while (col !== endCol) {
        if (col < endCol) col++;
        else col--;
        path.push({ row, col });
    }
    
    return path;
}

function displayPath(path) {
    path.forEach((pos, index) => {
        const cell = grid[pos.row][pos.col];
        cell.element.classList.add('path');
        
        if (!cell.hasApple) {
            const existingStepNum = cell.element.querySelector('.step-number');
            if (existingStepNum) {
                existingStepNum.remove();
            }
            
            const stepNum = document.createElement('div');
            stepNum.className = 'step-number';
            stepNum.textContent = index + 1;
            cell.element.appendChild(stepNum);
        }
    });
}

document.getElementById('findPathBtn').addEventListener('click', findPath);
document.getElementById('resetBtn').addEventListener('click', () => {
    initGrid();
    clearPath();
});

initGrid();
