const gridSize = 4; 

let currentPlayer = 1;
let player1Score = 0;
let player2Score = 0;

let horizontalEdges = Array(gridSize + 1).fill(null).map(() => Array(gridSize).fill(0));
let verticalEdges = Array(gridSize).fill(null).map(() => Array(gridSize + 1).fill(0));

const encloseGrid = document.getElementById('encloseGrid');
const currentPlayerSpan = document.getElementById('currentPlayer');
const player1ScoreSpan = document.getElementById('player1Score');
const player2ScoreSpan = document.getElementById('player2Score');
const resetBtn = document.getElementById('resetBtn');
const backBtn = document.getElementById('backBtn');
const finalResult = document.getElementById('finalResult');


initializeGrid();

function initializeGrid() {
    encloseGrid.innerHTML = '';
    finalResult.innerHTML = '';
    currentPlayer = 1;
    player1Score = 0;
    player2Score = 0;
    currentPlayerSpan.textContent = currentPlayer;
    player1ScoreSpan.textContent = player1Score;
    player2ScoreSpan.textContent = player2Score;


    horizontalEdges = Array(gridSize + 1).fill(null).map(() => Array(gridSize).fill(0));
    verticalEdges = Array(gridSize).fill(null).map(() => Array(gridSize + 1).fill(0));


    for (let y = 0; y <= gridSize; y++) {
        for (let x = 0; x <= gridSize; x++) {

            if (x < gridSize && y < gridSize) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.style.top = `${y * 40}px`;
                cell.style.left = `${x * 40}px`;
                cell.dataset.x = x;
                cell.dataset.y = y;
                encloseGrid.appendChild(cell);
            }


            if (y < gridSize + 1 && x < gridSize) {
                const hEdge = document.createElement('div');
                hEdge.classList.add('edge', 'horizontal');
                hEdge.style.top = `${y * 40 - 2}px`;
                hEdge.style.left = `${x * 40}px`;
                hEdge.dataset.type = 'horizontal';
                hEdge.dataset.x = x;
                hEdge.dataset.y = y;
                hEdge.addEventListener('click', () => handleEdgeClick('horizontal', x, y));
                encloseGrid.appendChild(hEdge);
            }


            if (x < gridSize + 1 && y < gridSize) {
                const vEdge = document.createElement('div');
                vEdge.classList.add('edge', 'vertical');
                vEdge.style.top = `${y * 40}px`;
                vEdge.style.left = `${x * 40 - 2}px`; 
                vEdge.dataset.type = 'vertical';
                vEdge.dataset.x = x;
                vEdge.dataset.y = y;
                vEdge.addEventListener('click', () => handleEdgeClick('vertical', x, y));
                encloseGrid.appendChild(vEdge);
            }
        }
    }
}

function handleEdgeClick(type, x, y) {
    if (type === 'horizontal') {
        if (horizontalEdges[y][x] !== 0) return; 
        horizontalEdges[y][x] = currentPlayer;
    } else {
        if (verticalEdges[y][x] !== 0) return; 
        verticalEdges[y][x] = currentPlayer;
    }

    updateEdgeDisplay(type, x, y);

    const completed = checkCompletion(type, x, y);

    if (completed.length > 0) {
        completed.forEach(cell => {
            const [cellX, cellY] = cell;
            markCell(cellX, cellY);
            if (currentPlayer === 1) {
                player1Score++;
                player1ScoreSpan.textContent = player1Score;
            } else {
                player2Score++;
                player2ScoreSpan.textContent = player2Score;
            }
        });
       
    } else {
        
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        currentPlayerSpan.textContent = currentPlayer;
    }

    checkGameEnd();
}

function updateEdgeDisplay(type, x, y) {
    const edge = document.querySelector(`.edge[data-type="${type}"][data-x="${x}"][data-y="${y}"]`);
    if (edge) {
        edge.classList.add('active');
        edge.classList.add(`player${currentPlayer}`);
    }
}

function markCell(x, y) {
    const cell = document.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
    if (cell) {
        
        cell.classList.remove('completed1', 'completed2');

        if (currentPlayer === 1) {
            cell.classList.add('completed1');
        } else {
            cell.classList.add('completed2');
        }
    }
}

function checkCompletion(type, x, y) {
    const completedCells = [];

    
    if (type === 'horizontal') {
       
        if (y > 0) {
            const top = horizontalEdges[y - 1][x] !== 0;
            const left = verticalEdges[y - 1][x] !== 0;
            const right = verticalEdges[y - 1][x + 1] !== 0;
            const bottom = horizontalEdges[y][x] !== 0;

           
            console.log(`(${x}, ${y - 1}):`, { top, left, right, bottom });

            if (top && left && right && bottom) {
                completedCells.push([x, y - 1]);
            }
        }
       
        if (y < gridSize) {
            const top = horizontalEdges[y][x] !== 0;
            const left = verticalEdges[y][x] !== 0;
            const right = verticalEdges[y][x + 1] !== 0;
            const bottom = horizontalEdges[y + 1][x] !== 0;

            
            console.log(`C(${x}, ${y}):`, { top, left, right, bottom });

            if (top && left && right && bottom) {
                completedCells.push([x, y]);
            }
        }
    } else if (type === 'vertical') {
        
        if (x > 0) {
            const left = verticalEdges[y][x - 1] !== 0;
            const top = horizontalEdges[y][x - 1] !== 0;
            const bottom = horizontalEdges[y + 1][x - 1] !== 0;
            const right = verticalEdges[y][x] !== 0;

            
            console.log(`(${x - 1}, ${y}):`, { left, top, bottom, right });

            if (left && top && bottom && right) {
                completedCells.push([x - 1, y]);
            }
        }
        
        if (x < gridSize) {
            const left = verticalEdges[y][x] !== 0;
            const top = horizontalEdges[y][x] !== 0;
            const bottom = horizontalEdges[y + 1][x] !== 0;
            const right = verticalEdges[y][x + 1] !== 0;

            
            console.log(`(${x}, ${y}):`, { left, top, bottom, right });

            if (left && top && bottom && right) {
                completedCells.push([x, y]);
            }
        }
    }

    return completedCells;
}

function checkGameEnd() {
    let allCompleted = true;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
            if (!cell.classList.contains('completed1') && !cell.classList.contains('completed2')) {
                allCompleted = false;
                break;
            }
        }
        if (!allCompleted) break;
    }

    if (allCompleted) {
        finalResult.innerHTML = `<p>A játék véget ért!</p>
                                  <p>Játékos 1 pontja: ${player1Score}</p>
                                  <p>Játékos 2 pontja: ${player2Score}</p>`;
    }
}

resetBtn.addEventListener('click', initializeGrid);

backBtn.addEventListener('click', () => {
    window.location.href = '../../index.html';
});